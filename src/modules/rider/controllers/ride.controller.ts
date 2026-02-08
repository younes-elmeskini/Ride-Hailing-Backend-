import { Request, Response } from "express";
import prisma from "../../../utils/client";
import RideValidation from "../utils/validation/ride";
import { validationResult } from "../../../utils/validation/validationResult";
import { z } from "zod";
import { checkRateLimit, haversineDistance, calculatePrice, estimateEtaMinutes } from "../utils/helperfunctions";

type CreateRideInput = z.infer<typeof RideValidation.createRideSchema>;
type EstimateRideInput = z.infer<typeof RideValidation.estimateRideSchema>;
type CancelRideInput = z.infer<typeof RideValidation.cancelRideSchema>;

export default class RideController {
  // estimation de time, price, distance
  static async createRide(req: Request, res: Response): Promise<void> {
    try {
      if (!validationResult(RideValidation.createRideSchema, req, res)) {
        return;
      }
      const parsedData: CreateRideInput = RideValidation.createRideSchema.parse(
        req.body
      );
      const riderId = req.rider?.id;

      if (!riderId) {
        res.status(401).json({ message: "Unauthorized: Rider not found." });
        return;
      }

      // 2️⃣ Validation: check active ride
      const activeRide = await prisma.ride.findFirst({
        where: {
          riderId,
          status: {
            in: ["MATCHING", "DRIVER_ASSIGNED", "ARRIVED", "ONGOING"],
          },
        },
      });
      if (activeRide) {
        res.status(400).json({ message: "You already have an active ride." });
        return;
      }

      const allowed = await checkRateLimit(riderId);
      if (!allowed) {
        res
          .status(429)
          .json({ message: "Too many ride requests in last 10 minutes." });
        return;
      }

      // 4️⃣ Estimate distance & price (simple Haversine formula)
      const distance = haversineDistance(
        parsedData.startLat,
        parsedData.startLng,
        parsedData.endLat,
        parsedData.endLng
      ); // km
      const price = calculatePrice(distance);

      // 5️⃣ Create ride
      const ride = await prisma.ride.create({
        data: {
          riderId,
          startLat: parsedData.startLat,
          startLng: parsedData.startLng,
          endLat: parsedData.endLat,
          endLng: parsedData.endLng,
          distance,
          price,
          status: "MATCHING",
        },
      });
      if (!ride) {
        res.status(400).json({ message: "Failed to create ride." });
        return;
      }

      // 1️⃣ Find nearest available driver
      const availableDrivers = await prisma.driver.findMany({
        where: {
          status: "AVAILABLE",
          lat: {
            not: null,
          },
          lng: {
            not: null,
          },
        },
      });

      // If no driver available
      if (!availableDrivers.length) {
        res.status(200).json({
          message: "Ride created but no drivers available yet.",
          ride,
        });
        return;
      }

      // Compute distances
      let nearestDriver = null;
      let minDistance = Infinity;

      for (const driver of availableDrivers) {
        const dist = haversineDistance(
          parsedData.startLat,
          parsedData.startLng,
          driver.lat || 0,
          driver.lng || 0
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestDriver = driver;
        }
      }

      // 2️⃣ Create driver offer
      if (nearestDriver) {
        const driverOffer = await prisma.driverOffer.create({
          data: {
            driverId: nearestDriver.id,
            rideId: ride.id,
            expiresAt: new Date(Date.now() + 60 * 1000), // 15 seconds TTL (60 seconds just for testing)
          },
        });
        if (!driverOffer) {
          res.status(400).json({ message: "Failed to create driver offer." });
          return;
        }
      }

      res.status(201).json({ message: "Ride created successfully", ride });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  static async estimateRide(req: Request, res: Response): Promise<void> {
    try {
      if (!validationResult(RideValidation.estimateRideSchema, req, res)) {
        return;
      }
      const parsedData: EstimateRideInput = RideValidation.estimateRideSchema.parse(req.body);
      const distance = haversineDistance(
        parsedData.startLat,
        parsedData.startLng,
        parsedData.endLat,
        parsedData.endLng
      );
      const price = calculatePrice(distance);
      const eta = estimateEtaMinutes(distance);
      
      res.status(200).json({ distance, eta, price });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  static async cancelRide(req: Request, res: Response): Promise<void> {
    try {
      if (!validationResult(RideValidation.cancelRideSchema, req, res)) {
        return;
      }
      const parsedData: CancelRideInput = RideValidation.cancelRideSchema.parse(req.body);
      const riderId = req.rider?.id;
      if (!riderId) {
        res.status(401).json({ message: "Unauthorized: Rider not found." });
        return;
      }
      const ride = await prisma.ride.findFirst({
        where: { id: parsedData.rideId, riderId },
      });
      if (!ride) {
        res.status(404).json({ message: "Ride not found." });
        return;
      }
      if (ride.status === "CANCELLED") {
        res.status(400).json({ message: "Ride is already cancelled." });
        return;
      }
      const isMatching = ride.status === "MATCHING";
      if (!isMatching && !parsedData.reason?.trim()) {
        res.status(400).json({ message: "Reason is required when cancelling a ride after driver assignment." });
        return;
      }
      const payload = parsedData.reason ? JSON.stringify({ reason: parsedData.reason }) : null;
      await prisma.$transaction([
        prisma.ride.update({
          where: { id: ride.id },
          data: { status: "CANCELLED" },
        }),
        prisma.rideEvent.create({
          data: {
            rideId: ride.id,
            eventType: "CANCELLED",
            payload,
          },
        }),
      ]);
      res.status(200).json({ message: "Ride cancelled successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  static async rideHistory(req: Request, res: Response): Promise<void> {
    try {
      const riderId = req.rider?.id;
      if (!riderId) {
        res.status(401).json({ message: "Unauthorized: Rider not found." });
        return;
      }
      const rides = await prisma.ride.findMany({
        where: { riderId },
        orderBy: { createdAt: "desc" },
        include: {
          driver: { select: { id: true, fullName: true, email: true } },
        },
      });
      res.status(200).json({ rides });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
}






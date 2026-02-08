import { Request, Response } from "express";
import prisma from "../../../utils/client";
import { estimateEtaMinutes } from "../../rider/utils/helperfunctions";

export default class ShareController {
  static async getShareTrip(req: Request, res: Response): Promise<void> {
    try {
      const rideId = typeof req.params.rideId === "string" ? req.params.rideId : req.params.rideId?.[0];
      if (!rideId) {
        res.status(400).json({ message: "rideId is required." });
        return;
      }
      const ride = await prisma.ride.findUnique({
        where: { id: rideId },
        include: { driver: true },
      });
      if (!ride) {
        res.status(404).json({ message: "Ride not found." });
        return;
      }
      let eta: number | null = null;
      if (ride.distance != null && ride.status !== "COMPLETED" && ride.status !== "CANCELLED") {
        eta = estimateEtaMinutes(ride.distance);
      }
      res.status(200).json({
        status: ride.status,
        eta,
        driver: ride.driver
          ? {
              id: ride.driver.id,
              fullName: ride.driver.fullName,
              email: ride.driver.email,
            }
          : null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
}

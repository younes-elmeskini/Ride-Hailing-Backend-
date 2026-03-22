import { Request, Response } from 'express';
import prisma from '../../../utils/client';

export default class RideController {

  static async getActiveRide(req: Request, res: Response): Promise<void> {
    try {
      const driverId = req.driver?.id;
      if (!driverId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const ride = await prisma.ride.findFirst({
        where: {
          driverId,
          status: {
            in: ['DRIVER_ASSIGNED', 'ARRIVED', 'ONGOING'],
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      res.status(200).json({ ride: ride ?? null });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to get active ride', details: error.message });
    }
  }

  static async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      const {lat, lng } = req.body;
      const driverId = req.driver?.id;
      if (!driverId || lat === undefined || lng === undefined) {
        res.status(400).json({ error: 'driverId, lat and lng are required' });
        return;
      }
      const updatedDriver = await prisma.driver.update({
        where: { id: driverId },
        data: {
          lat,
          lng,
        },
      });
      if (!updatedDriver) {
        res.status(400).json({ error: 'Failed to update driver location' });
        return;
      }
       res.status(200).json({ message: 'Driver location updated successfully', driver: updatedDriver });
    } catch (error: any) {
       res.status(500).json({ error: 'Failed to update driver location', details: error.message });
    }
  } 

  static async getDriverOffers(req: Request, res: Response): Promise<void> {
    try {
      const driverId = req.driver?.id;
      const driverOffers = await prisma.driverOffer.findMany({
        where: { driverId , status: 'PENDING'},
        include: {
          ride: {
            select: {
              id: true,
              startLat: true,
              startLng: true,
              endLat: true,
              endLng: true,
              distance: true,
              price: true,
              duration: true,
              status: true,
            },
          },
        },
    
      });
      if (driverOffers.length === 0) {
        res.status(200).json({ message: 'No driver offers found', driverOffers: [] });
        return;
      }
      res.status(200).json({ message: 'Driver offers fetched successfully', driverOffers });
    }
    catch (error: any) {
      res.status(500).json({ error: 'Failed to get driver offers', details: error.message });
    }
  } 

  static async confirmDriverOffer(req: Request, res: Response): Promise<void> {
    try {
      const { rideId } = req.body;
      const driverId = req.driver?.id;
      if (!driverId || !rideId) {
        res.status(400).json({ error: 'driverId and rideId are required' });
        return;
      }
      // Find the driverOffer
      const driverOffer = await prisma.driverOffer.findFirst({
        where: {
          rideId,
          status: 'PENDING',
        },
      });

      if (!driverOffer) {
         res.status(404).json({ error: 'Driver offer not found or already processed' });
         return;
      }

      // Check TTL expiration
      const now = new Date();
      if (driverOffer.expiresAt < now) {
         res.status(400).json({ error: 'Driver offer has expired' });
         return;
      }

      // Update ride status and driverOffer status in a transaction
      await prisma.$transaction([
        prisma.driver.update({
          where: { id: driverId },
          data: { status: 'BUSY' },
        }),
        prisma.ride.update({
          where: { id: rideId },
          data: { driverId, status: 'DRIVER_ASSIGNED' },
        }),
        prisma.driverOffer.update({
          where: { id: driverOffer.id },
          data: { status: 'ACCEPTED' },
        }),
      ]);

       res.status(200).json({ message: 'Driver offer confirmed, ride assigned' });
    } catch (error: any) {
       res.status(500).json({ error: 'Failed to confirm driver offer', details: error.message });
    }
  }

  static async driverArrived(req: Request, res: Response): Promise<void> {
    try {
      const { rideId } = req.body;
      const driverId = req.driver?.id;
      if (!driverId || !rideId) {
        res.status(400).json({ error: 'rideId is required' });
        return;
      }
      const ride = await prisma.ride.findFirst({
        where: { id: rideId, driverId },
      });
      if (!ride) {
        res.status(404).json({ error: 'Ride not found or you are not assigned to this ride' });
        return;
      }
      if (ride.status !== 'DRIVER_ASSIGNED') {
        res.status(400).json({ error: 'Ride status must be DRIVER_ASSIGNED to mark as arrived' });
        return;
      }
      await prisma.$transaction([
        prisma.ride.update({
          where: { id: rideId },
          data: { status: 'ARRIVED' },
        }),
        prisma.rideEvent.create({
          data: { rideId, eventType: 'ARRIVED' },
        }),
      ]);
      res.status(200).json({ message: 'Driver arrived successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update ride', details: error.message });
    }
  }

  static async startRide(req: Request, res: Response): Promise<void> {
    try {
      const { rideId } = req.body;
      const driverId = req.driver?.id;
      if (!driverId || !rideId) {
        res.status(400).json({ error: 'rideId is required' });
        return;
      }
      const ride = await prisma.ride.findFirst({
        where: { id: rideId, driverId },
      });
      if (!ride) {
        res.status(404).json({ error: 'Ride not found or you are not assigned to this ride' });
        return;
      }
      if (ride.status !== 'ARRIVED') {
        res.status(400).json({ error: 'Ride status must be ARRIVED to start' });
        return;
      }
      await prisma.$transaction([
        prisma.ride.update({
          where: { id: rideId },
          data: { status: 'ONGOING', startDate: new Date() },
        }),
        prisma.rideEvent.create({
          data: { rideId, eventType: 'STARTED' },
        }),
      ]);
      res.status(200).json({ message: 'Ride started successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to start ride', details: error.message });
    }
  }

  static async completeRide(req: Request, res: Response): Promise<void> {
    try {
      const { rideId } = req.body;
      const driverId = req.driver?.id;
      if (!driverId || !rideId) {
        res.status(400).json({ error: 'rideId is required' });
        return;
      }
      const ride = await prisma.ride.findFirst({
        where: { id: rideId, driverId },
      });
      if (!ride) {
        res.status(404).json({ error: 'Ride not found or you are not assigned to this ride' });
        return;
      }
      if (ride.status !== 'ONGOING') {
        res.status(400).json({ error: 'Ride status must be ONGOING to complete' });
        return;
      }
      const endDate = new Date();
      await prisma.$transaction([
        prisma.ride.update({
          where: { id: rideId },
          data: { status: 'COMPLETED', endDate },
        }),
        prisma.driver.update({
          where: { id: driverId },
          data: { status: 'AVAILABLE' },
        }),
        prisma.rideEvent.create({
          data: { rideId, eventType: 'COMPLETED' },
        }),
      ]);
      res.status(200).json({ message: 'Ride completed successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to complete ride', details: error.message });
    }
  }
}



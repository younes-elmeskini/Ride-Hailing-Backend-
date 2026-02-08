import { Request, Response } from 'express';
import prisma from '../../../utils/client';

export default class RideController {

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
        where: { driverId },
      });
      if (driverOffers.length === 0) {
        res.status(400).json({ message: 'No driver offers found' });
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
      const { driverId, rideId } = req.body;

      if (!driverId || !rideId) {
        res.status(400).json({ error: 'driverId and rideId are required' });
        return;
      }

      // Find the driverOffer
      const driverOffer = await prisma.driverOffer.findFirst({
        where: {
          driverId,
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
}



import { Request, Response } from "express";
import prisma from "../../../utils/client";

export default class RideEventsController {
  static async getRideEvents(req: Request, res: Response): Promise<void> {
    try {
      const rideId = typeof req.params.rideId === "string" ? req.params.rideId : req.params.rideId?.[0];
      if (!rideId) {
        res.status(400).json({ message: "rideId is required." });
        return;
      }
      const events = await prisma.rideEvent.findMany({
        where: { rideId },
        orderBy: { createdAt: "asc" },
      });
      res.status(200).json({ events });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
}

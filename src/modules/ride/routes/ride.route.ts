import express from "express";
import RideEventsController from "../controllers/rideEvents.controller";

const router = express.Router();

router.get("/:rideId/events", RideEventsController.getRideEvents);

export default router;

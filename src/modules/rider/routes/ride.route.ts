import express from "express";
import RideController from "../controllers/ride.controller";
import {authenticate} from "../middleware/auth";

const router = express.Router();

router.post("/estimate", authenticate, RideController.estimateRide);
router.post("/create", authenticate, RideController.createRide);
router.post("/cancel", authenticate, RideController.cancelRide);
router.get("/history", authenticate, RideController.rideHistory);

export default router;
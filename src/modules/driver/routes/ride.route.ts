import express from "express";
import RideController from "../controllers/ride.controller";
import {authenticate} from "../middleware/auth";

const router = express.Router();

router.post("/confirm-ride", authenticate, RideController.confirmDriverOffer);
router.get("/offers", authenticate, RideController.getDriverOffers);
router.put("/update-location", authenticate, RideController.updateLocation);
router.post("/arrived", authenticate, RideController.driverArrived);
router.post("/start", authenticate, RideController.startRide);
router.post("/complete", authenticate, RideController.completeRide);

export default router;
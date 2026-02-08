import express from "express";
import RideController from "../controllers/ride.controller";
import {authenticate} from "../middleware/auth";

const router = express.Router();

router.post("/confirm-ride", authenticate, RideController.confirmDriverOffer);
router.get("/offers", authenticate, RideController.getDriverOffers);
router.put("/update-location", authenticate, RideController.updateLocation);

export default router;
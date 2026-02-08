import express from "express";
import ShareController from "../controllers/share.controller";

const router = express.Router();

router.get("/:rideId", ShareController.getShareTrip);

export default router;

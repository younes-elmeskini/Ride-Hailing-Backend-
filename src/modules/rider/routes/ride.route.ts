import express from "express";
import RideController from "../controllers/ride.controller";
import {authenticate} from "../middleware/auth";

const router = express.Router();

router.post("/create", authenticate, RideController.createRide);

export default router;
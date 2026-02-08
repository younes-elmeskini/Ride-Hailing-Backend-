import express from "express";
import authRider from "../modules/rider/routes/auth.route";
import authDriver from "../modules/driver/routes/auth.route";
import rideRider from "../modules/rider/routes/ride.route";

const router = express.Router();

router.use("/rider/auth", authRider);
router.use("/rider/ride", rideRider);
router.use("/driver/auth", authDriver);
export default router;

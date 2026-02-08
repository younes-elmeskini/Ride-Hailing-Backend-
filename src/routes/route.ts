import express from "express";
import authRider from "../modules/rider/routes/auth.route";
import authDriver from "../modules/driver/routes/auth.route";
import rideRider from "../modules/rider/routes/ride.route";
import rideDriver from "../modules/driver/routes/ride.route";
import rideEvents from "../modules/ride/routes/ride.route";
import shareTrip from "../modules/ride/routes/share.route";

const router = express.Router();

router.use("/rider/auth", authRider);
router.use("/rider/ride", rideRider);
router.use("/driver/auth", authDriver);
router.use("/driver/ride", rideDriver);
router.use("/ride", rideEvents);
router.use("/share", shareTrip);
export default router;

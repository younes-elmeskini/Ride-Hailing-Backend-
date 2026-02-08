import express from "express";
import authRider from "../modules/rider/routes/auth.route";


const router = express.Router();

router.use("/rider/auth", authRider);

export default router;

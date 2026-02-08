import express from "express";
import AuthController from "../controllers/auth.controller";
import {authenticate} from "../middleware/auth";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authenticate, AuthController.riderData);
router.post("/logout", AuthController.logout);

export default router;

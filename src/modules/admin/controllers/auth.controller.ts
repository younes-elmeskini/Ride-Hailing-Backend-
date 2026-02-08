import { Request, Response } from "express";
import prisma from "../../../utils/client";
import { z } from "zod";
import * as argon2 from "argon2";
import { generateToken } from "../middleware/auth";
import AuthValidation from "../../../utils/validation/auth";
import { validationResult } from "../../../utils/validation/validationResult";

type CreateUserInput = z.infer<typeof AuthValidation.createUserSchema>;

type LoginUserInput = z.infer<typeof AuthValidation.loginSchema>;

export default class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      validationResult(AuthValidation.createUserSchema, req, res);
      const parsedData: CreateUserInput = AuthValidation.createUserSchema.parse(
        req.body
      );
      const admin = await prisma.admin.create({
        data: {
          fullName: parsedData.fullName,
          email: parsedData.email,
          password: await argon2.hash(parsedData.password),
        },
      });
      if (!admin) {
        res.status(400).json({ message: "Failed to create account" });
        return;
      }
      res.status(201).json({ message: "Account created successfully" });
    }
    catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  static async login(req: Request, res: Response): Promise<void> {
    try {
      validationResult(AuthValidation.loginSchema, req, res);
      const parsedData: LoginUserInput = AuthValidation.loginSchema.parse(
        req.body
      );
      const admin = await prisma.admin.findUnique({
        where: { email: parsedData.email },
      });

      if (!admin) {
        res.status(404).json({ message: "Invalid email" });
        return;
      }

      const isPasswordValid: boolean = await argon2.verify(
        admin.password!,
        parsedData.password
      );
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }
      const token = generateToken(admin);
      if (!token) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }
      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
        domain: isProduction ? ".farmteck.onrender.com" : undefined,
        path: "/",
      });

      res.status(200).json({
        message: "Login successful",
        isProduction: isProduction,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  }
  static async adminData(req: Request, res: Response): Promise<void> {
    try {
      const adminId = req.admin?.id;
      if (!adminId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      });
          if (!admin) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json({ data: admin });
    } catch (error) {
      console.error("Error fetching Driver data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  static async logout(req: Request, res: Response) {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  }
}

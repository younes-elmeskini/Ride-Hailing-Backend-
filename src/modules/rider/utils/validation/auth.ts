import { z } from "zod";
export default class AuthValidation {
  static createUserSchema = z.object({
    fullName: z.string().min(3, { message: "Full name must be at least 3 characters long." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),
  });
  static loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),
  });
  static resetPasswordSchema = z.object({
    token: z.string().min(1, { message: "Reset token is required." }),
    newPassword: z
      .string()
      .min(10, {
        message: "New password must be at least 10 characters long.",
      }),
  });
  static forgetPasswordSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
  });
}
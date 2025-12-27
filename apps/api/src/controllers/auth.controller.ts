import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { ApiResponseHandler } from "../utils/response";
import { RegisterRequestSchema, LoginRequestSchema } from "@eduverse/shared";
import { logger } from "../utils/logger";

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const validation = RegisterRequestSchema.safeParse(req.body);

      if (!validation.success) {
        ApiResponseHandler.validationError(res, "Invalid input", validation.error.errors);
        return;
      }

      const { email, password, firstName, lastName, role } = validation.data;

      const result = await authService.register(email, password, firstName, lastName, role as any);

      ApiResponseHandler.created(res, result);
    } catch (error) {
      logger.error("Registration failed", { error });

      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          ApiResponseHandler.badRequest(res, error.message);
          return;
        }
      }

      ApiResponseHandler.error(res, "REGISTRATION_FAILED", "Failed to register user");
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validation = LoginRequestSchema.safeParse(req.body);

      if (!validation.success) {
        ApiResponseHandler.validationError(res, "Invalid input", validation.error.errors);
        return;
      }

      const { email, password } = validation.data;
      const result = await authService.login(email, password);

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      ApiResponseHandler.success(res, result);
    } catch (error) {
      logger.warn("Login failed", { error });

      if (error instanceof Error && error.message.includes("Invalid credentials")) {
        ApiResponseHandler.unauthorized(res, "Invalid credentials");
        return;
      }

      ApiResponseHandler.error(res, "LOGIN_FAILED", "Failed to login");
    }
  }

  static async studentLogin(req: Request, res: Response): Promise<void> {
    try {
      const { rollNo, password } = req.body;

      if (!rollNo || !password) {
        ApiResponseHandler.badRequest(res, "Roll number and password are required");
        return;
      }

      const result = await authService.studentLogin(rollNo, password);

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      ApiResponseHandler.success(res, result);
    } catch (error) {
      logger.warn("Student login failed", { error });

      if (error instanceof Error && error.message.includes("Invalid credentials")) {
        ApiResponseHandler.unauthorized(res, "Invalid credentials");
        return;
      }

      ApiResponseHandler.error(res, "LOGIN_FAILED", "Failed to login");
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        ApiResponseHandler.unauthorized(res, "Refresh token required");
        return;
      }

      const result = await authService.refreshToken(refreshToken);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponseHandler.success(res, result);
    } catch (error) {
      logger.warn("Token refresh failed", { error });
      ApiResponseHandler.unauthorized(res, "Invalid refresh token");
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const profile = await authService.getProfile(req.user.id);
      ApiResponseHandler.success(res, profile);
    } catch (error) {
      logger.error("Failed to get profile", { error });
      ApiResponseHandler.notFound(res, "User not found");
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie("refreshToken");
    ApiResponseHandler.success(res, { message: "Logged out successfully" });
  }
}

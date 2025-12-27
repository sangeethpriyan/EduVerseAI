import express, { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware, requirePermission } from "../middleware/auth";
import { Permission } from "@eduverse/shared";

const router: Router = express.Router();

// Public routes
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.post("/auth/student-login", AuthController.studentLogin);
router.post("/auth/refresh", AuthController.refreshToken);
router.post("/auth/logout", authMiddleware, AuthController.logout);

// Protected routes
router.get("/auth/profile", authMiddleware, AuthController.getProfile);

export default router;

import express, { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware, requirePermission } from "../middleware/auth";
import { Permission } from "@eduverse/shared";

const router: Router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Overview dashboard
router.get("/admin/overview", requirePermission(Permission.VIEW_ANALYTICS), AdminController.getOverview);

// Students
router.get("/admin/students", requirePermission(Permission.MANAGE_STUDENTS), AdminController.getStudents);
router.post("/admin/students", requirePermission(Permission.MANAGE_STUDENTS), AdminController.createStudent);
router.post("/admin/students/promote", requirePermission(Permission.MANAGE_STUDENTS), AdminController.promoteStudents);

// Fees
router.post("/admin/students/:studentId/fees", requirePermission(Permission.MANAGE_FEES), AdminController.createFeeStructure);

// Analytics
router.get("/admin/analytics", requirePermission(Permission.VIEW_ANALYTICS), AdminController.getAnalytics);
router.get("/admin/analytics/dropout-risk", requirePermission(Permission.VIEW_ANALYTICS), AdminController.getDropoutRisk);

export default router;


import express from "express";
import { StudentController } from "../controllers/student.controller";
import { authMiddleware, requirePermission } from "../middleware/auth";
import { Permission } from "@eduverse/shared";
import { upload } from "../services/upload.service";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Overview dashboard
router.get("/student/overview", requirePermission(Permission.VIEW_OWN_COURSES), StudentController.getOverview);

// Courses
router.get("/student/courses", requirePermission(Permission.VIEW_OWN_COURSES), StudentController.getCourses);
router.get("/student/courses/:courseId", requirePermission(Permission.VIEW_OWN_COURSES), StudentController.getCourseDetails);

// Assignments
router.get("/student/assignments/:courseId", requirePermission(Permission.VIEW_OWN_ASSIGNMENTS), StudentController.getAssignments);
router.post("/student/assignments/:assignmentId/submit", requirePermission(Permission.SUBMIT_ASSIGNMENT), upload.single("file"), StudentController.submitAssignment);

// Attendance
router.get("/student/attendance", requirePermission(Permission.VIEW_OWN_ATTENDANCE), StudentController.getAttendance);

// Fees
router.get("/student/fees", requirePermission(Permission.VIEW_OWN_FEES), StudentController.getFees);

export default router;


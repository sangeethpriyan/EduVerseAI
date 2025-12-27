import express from "express";
import { TeacherController } from "../controllers/teacher.controller";
import { authMiddleware, requirePermission } from "../middleware/auth";
import { Permission } from "@eduverse/shared";
import { upload } from "../services/upload.service";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Overview dashboard
router.get("/teacher/overview", requirePermission(Permission.CREATE_COURSE), TeacherController.getOverview);

// Courses
router.get("/teacher/courses", requirePermission(Permission.CREATE_COURSE), TeacherController.getCourses);
router.get("/teacher/courses/:courseId", requirePermission(Permission.CREATE_COURSE), TeacherController.getCourseDetails);
router.post("/teacher/courses", requirePermission(Permission.CREATE_COURSE), TeacherController.createCourse);

// Materials
router.post("/teacher/courses/:courseId/materials", requirePermission(Permission.MANAGE_COURSE_MATERIALS), upload.single("file"), TeacherController.createMaterial);

// Assignments
router.post("/teacher/courses/:courseId/assignments", requirePermission(Permission.CREATE_ASSIGNMENTS), TeacherController.createAssignment);
router.post("/teacher/assignments/:assignmentId/submissions/:submissionId/grade", requirePermission(Permission.GRADE_ASSIGNMENTS), TeacherController.gradeAssignment);

// Attendance
router.post("/teacher/classes/:classId/attendance", requirePermission(Permission.MARK_ATTENDANCE), TeacherController.markAttendance);

// Marks
router.post("/teacher/courses/:courseId/marks", requirePermission(Permission.ENTER_MARKS), TeacherController.enterMarks);

// Reports
router.get("/teacher/reports", requirePermission(Permission.GENERATE_REPORTS), TeacherController.getReports);

export default router;


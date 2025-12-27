import { Request, Response } from "express";
import { studentService } from "../services/student.service";
import { ApiResponseHandler } from "../utils/response";
import { logger } from "../utils/logger";
import { prisma } from "@eduverse/db";
import * as crypto from "crypto";
import * as fs from "fs/promises";

export class StudentController {
  static async getOverview(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      // Get student profile
      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
      });

      if (!student) {
        ApiResponseHandler.notFound(res, "Student profile not found");
        return;
      }

      const [courses, attendance, fees, assignments] = await Promise.all([
        studentService.getEnrolledCourses(student.id, 1, 5),
        studentService.getAttendanceStatus(student.id),
        studentService.getFeeStatus(student.id),
        prisma.assignmentSubmission.findMany({
          where: { studentId: student.id },
          include: {
            assignment: {
              select: {
                id: true,
                title: true,
                dueDate: true,
                course: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

      const overview = {
        student: {
          id: student.id,
          rollNo: student.rollNo,
        },
        courses: courses.data,
        attendance,
        fees,
        pendingAssignments: assignments.filter(
          (a) => new Date(a.assignment.dueDate) > new Date() && !a.score
        ),
      };

      ApiResponseHandler.success(res, overview);
    } catch (error: any) {
      logger.error("Failed to get student overview", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }

  static async submitAssignment(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const { assignmentId } = req.params;
      const file = req.file as Express.Multer.File;

      if (!file) {
        ApiResponseHandler.badRequest(res, "File is required");
        return;
      }

      // Get student
      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
      });

      if (!student) {
        ApiResponseHandler.notFound(res, "Student profile not found");
        return;
      }

      // Upload file
      const { uploadService } = await import("../services/upload.service");
      const uploadResult = await uploadService.uploadFile(file);

      // Generate content hash (if file buffer is available)
      let hash = "";
      try {
        if (file.buffer) {
          hash = crypto.createHash("sha256").update(file.buffer).digest("hex");
        } else if (file.path) {
          const fileBuffer = await fs.readFile(file.path);
          hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
        }
      } catch (err) {
        // Hash generation is optional
        hash = `hash_${Date.now()}`;
      }

      // Create submission
      const submission = await prisma.assignmentSubmission.upsert({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId: student.id,
          },
        },
        update: {
          fileUrl: uploadResult.url,
          fileName: uploadResult.fileName,
          fileSizeBytes: uploadResult.fileSize,
          contentHash: hash,
          submittedAt: new Date(),
        },
        create: {
          assignmentId,
          studentId: student.id,
          fileUrl: uploadResult.url,
          fileName: uploadResult.fileName,
          fileSizeBytes: uploadResult.fileSize,
          contentHash: hash,
        },
      });

      ApiResponseHandler.created(res, submission);
    } catch (error: any) {
      logger.error("Failed to submit assignment", { error });
      ApiResponseHandler.error(res, "SUBMIT_FAILED", error.message);
    }
  }

  static async getCourses(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
      });

      if (!student) {
        ApiResponseHandler.notFound(res, "Student profile not found");
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const courses = await studentService.getEnrolledCourses(student.id, page, limit);
      ApiResponseHandler.success(res, courses);
    } catch (error: any) {
      logger.error("Failed to get courses", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }

  static async getCourseDetails(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
      });

      if (!student) {
        ApiResponseHandler.notFound(res, "Student profile not found");
        return;
      }

      const { courseId } = req.params;
      const course = await studentService.getCourseDetails(student.id, courseId);
      ApiResponseHandler.success(res, course);
    } catch (error: any) {
      logger.error("Failed to get course details", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }

  static async getAttendance(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
      });

      if (!student) {
        ApiResponseHandler.notFound(res, "Student profile not found");
        return;
      }

      const { courseId } = req.query;
      const attendance = await studentService.getAttendanceStatus(
        student.id,
        courseId as string
      );
      ApiResponseHandler.success(res, attendance);
    } catch (error: any) {
      logger.error("Failed to get attendance", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }

  static async getFees(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
      });

      if (!student) {
        ApiResponseHandler.notFound(res, "Student profile not found");
        return;
      }

      const fees = await studentService.getFeeStatus(student.id);
      ApiResponseHandler.success(res, fees);
    } catch (error: any) {
      logger.error("Failed to get fees", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }

  static async getAssignments(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
      });

      if (!student) {
        ApiResponseHandler.notFound(res, "Student profile not found");
        return;
      }

      const { courseId } = req.params;
      const assignments = await studentService.getAssignments(student.id, courseId);
      ApiResponseHandler.success(res, assignments);
    } catch (error: any) {
      logger.error("Failed to get assignments", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }
}


import { Request, Response } from "express";
import { teacherService } from "../services/teacher.service";
import { ApiResponseHandler } from "../utils/response";
import { logger } from "../utils/logger";

export class TeacherController {
  static async getOverview(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const overview = await teacherService.getOverview(req.user.id);
      ApiResponseHandler.success(res, overview);
    } catch (error: any) {
      logger.error("Failed to get teacher overview", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }

  static async getCourses(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const courses = await teacherService.getCourses(req.user.id);
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

      const { courseId } = req.params;
      const course = await teacherService.getCourseDetails(req.user.id, courseId);
      ApiResponseHandler.success(res, course);
    } catch (error: any) {
      logger.error("Failed to get course details", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }

  static async createCourse(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const course = await teacherService.createCourse(req.user.id, req.body);
      ApiResponseHandler.created(res, course);
    } catch (error: any) {
      logger.error("Failed to create course", { error });
      ApiResponseHandler.error(res, "CREATE_FAILED", error.message);
    }
  }

  static async createMaterial(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const { courseId } = req.params;
      const file = req.file as Express.Multer.File;
      
      if (!file) {
        ApiResponseHandler.badRequest(res, "File is required");
        return;
      }

      const { uploadService } = await import("../services/upload.service");
      const uploadResult = await uploadService.uploadFile(file);

      const material = await teacherService.createMaterial(req.user.id, courseId, {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type || "document",
        fileUrl: uploadResult.url,
        fileSizeBytes: uploadResult.fileSize,
      });

      ApiResponseHandler.created(res, material);
    } catch (error: any) {
      logger.error("Failed to create material", { error });
      ApiResponseHandler.error(res, "CREATE_FAILED", error.message);
    }
  }

  static async createAssignment(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const { courseId } = req.params;
      const assignment = await teacherService.createAssignment(
        req.user.id,
        courseId,
        req.body
      );
      ApiResponseHandler.created(res, assignment);
    } catch (error: any) {
      logger.error("Failed to create assignment", { error });
      ApiResponseHandler.error(res, "CREATE_FAILED", error.message);
    }
  }

  static async markAttendance(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const { classId } = req.params;
      const { date, attendanceRecords } = req.body;

      const records = await teacherService.markAttendance(
        req.user.id,
        classId,
        new Date(date),
        attendanceRecords
      );

      ApiResponseHandler.success(res, records);
    } catch (error: any) {
      logger.error("Failed to mark attendance", { error });
      ApiResponseHandler.error(res, "UPDATE_FAILED", error.message);
    }
  }

  static async enterMarks(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const { courseId } = req.params;
      const { marks } = req.body;

      const results = await teacherService.enterMarks(req.user.id, courseId, marks);
      ApiResponseHandler.success(res, results);
    } catch (error: any) {
      logger.error("Failed to enter marks", { error });
      ApiResponseHandler.error(res, "UPDATE_FAILED", error.message);
    }
  }

  static async gradeAssignment(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const { assignmentId, submissionId } = req.params;
      const { score, feedback } = req.body;

      const result = await teacherService.gradeAssignment(
        req.user.id,
        assignmentId,
        submissionId,
        score,
        feedback
      );

      ApiResponseHandler.success(res, result);
    } catch (error: any) {
      logger.error("Failed to grade assignment", { error });
      ApiResponseHandler.error(res, "UPDATE_FAILED", error.message);
    }
  }

  static async getReports(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const reports = await teacherService.getReports(req.user.id, req.query as any);
      ApiResponseHandler.success(res, reports);
    } catch (error: any) {
      logger.error("Failed to get reports", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }
}


import { Request, Response } from "express";
import { adminService } from "../services/admin.service";
import { ApiResponseHandler } from "../utils/response";
import { logger } from "../utils/logger";

export class AdminController {
  static async getOverview(req: Request, res: Response) {
    try {
      const overview = await adminService.getOverview();
      ApiResponseHandler.success(res, overview);
    } catch (error: any) {
      logger.error("Failed to get admin overview", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }

  static async getStudents(req: Request, res: Response) {
    try {
      const students = await adminService.getStudents(req.query as any);
      ApiResponseHandler.success(res, students);
    } catch (error: any) {
      logger.error("Failed to get students", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }

  static async createStudent(req: Request, res: Response) {
    try {
      const student = await adminService.createStudent(req.body);
      ApiResponseHandler.created(res, student);
    } catch (error: any) {
      logger.error("Failed to create student", { error });
      ApiResponseHandler.error(res, "CREATE_FAILED", error.message);
    }
  }

  static async promoteStudents(req: Request, res: Response) {
    try {
      const { fromSemester, toSemester } = req.body;
      const result = await adminService.promoteStudents(fromSemester, toSemester);
      ApiResponseHandler.success(res, result);
    } catch (error: any) {
      logger.error("Failed to promote students", { error });
      ApiResponseHandler.error(res, "UPDATE_FAILED", error.message);
    }
  }

  static async createFeeStructure(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const feeStructure = await adminService.createFeeStructure(studentId, req.body);
      ApiResponseHandler.created(res, feeStructure);
    } catch (error: any) {
      logger.error("Failed to create fee structure", { error });
      ApiResponseHandler.error(res, "CREATE_FAILED", error.message);
    }
  }

  static async getAnalytics(req: Request, res: Response) {
    try {
      const analytics = await adminService.getAnalytics();
      ApiResponseHandler.success(res, analytics);
    } catch (error: any) {
      logger.error("Failed to get analytics", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }

  static async getDropoutRisk(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const riskStudents = await adminService.getDropoutRiskStudents(limit);
      ApiResponseHandler.success(res, riskStudents);
    } catch (error: any) {
      logger.error("Failed to get dropout risk", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }
}


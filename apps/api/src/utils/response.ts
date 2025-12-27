import { Response } from "express";
import { ApiResponse, HTTP_STATUS } from "@eduverse/shared";

export class ApiResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    statusCode: number = HTTP_STATUS.OK,
    message?: string
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, HTTP_STATUS.CREATED);
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details?: unknown
  ): Response {
    const response: ApiResponse<undefined> = {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static unauthorized(res: Response, message: string = "Unauthorized"): Response {
    return this.error(res, "UNAUTHORIZED", message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(res: Response, message: string = "Forbidden"): Response {
    return this.error(res, "FORBIDDEN", message, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(res: Response, message: string = "Resource not found"): Response {
    return this.error(res, "NOT_FOUND", message, HTTP_STATUS.NOT_FOUND);
  }

  static badRequest(res: Response, message: string = "Bad request"): Response {
    return this.error(res, "BAD_REQUEST", message, HTTP_STATUS.BAD_REQUEST);
  }

  static validationError(
    res: Response,
    message: string = "Validation error",
    details?: unknown
  ): Response {
    return this.error(
      res,
      "VALIDATION_ERROR",
      message,
      HTTP_STATUS.BAD_REQUEST,
      details
    );
  }
}

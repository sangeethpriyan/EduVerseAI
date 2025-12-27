import { Request, Response, NextFunction } from "express";
import { jwtService } from "../utils/jwt";
import { ApiResponseHandler } from "../utils/response";
import { HTTP_STATUS, Permission, AuthUser } from "@eduverse/shared";
import { logger } from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      token?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ApiResponseHandler.unauthorized(res, "Missing or invalid authorization header");
      return;
    }

    const token = authHeader.substring(7);
    const payload = jwtService.verifyToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
      firstName: "",
      lastName: "",
      role: payload.role,
      permissions: payload.permissions,
    };
    req.token = token;

    next();
  } catch (error) {
    logger.warn("Token verification failed", { error });
    ApiResponseHandler.unauthorized(res, "Invalid or expired token");
  }
};

export const requirePermission =
  (...permissions: Permission[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponseHandler.unauthorized(res);
      return;
    }

    const hasPermission = permissions.some((p) => req.user!.permissions.includes(p));

    if (!hasPermission) {
      logger.warn("Permission denied", {
        userId: req.user.id,
        required: permissions,
        actual: req.user.permissions,
      });
      ApiResponseHandler.forbidden(res, "Insufficient permissions");
      return;
    }

    next();
  };

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error("Unhandled error", { error: err });

  if (err.message.includes("Validation")) {
    ApiResponseHandler.validationError(res, err.message);
    return;
  }

  ApiResponseHandler.error(
    res,
    "INTERNAL_SERVER_ERROR",
    err.message || "Internal server error",
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
};

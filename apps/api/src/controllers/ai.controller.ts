import { Request, Response } from "express";
import { aiService } from "../services/ai.service";
import { ApiResponseHandler } from "../utils/response";
import { logger } from "../utils/logger";

export class AIController {
  static async chat(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const { message, sessionId } = req.body;

      if (!message) {
        ApiResponseHandler.badRequest(res, "Message is required");
        return;
      }

      const result = await aiService.chatWithAssistant(
        req.user.id,
        req.user.role,
        message,
        sessionId
      );

      ApiResponseHandler.success(res, result);
    } catch (error: any) {
      logger.error("AI chat failed", { error });
      ApiResponseHandler.error(res, "AI_ERROR", error.message);
    }
  }

  static async generateQuiz(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const { content, numQuestions, difficulty } = req.body;

      if (!content) {
        ApiResponseHandler.badRequest(res, "Content is required");
        return;
      }

      const questions = await aiService.generateQuizQuestions(
        content,
        numQuestions || 10,
        difficulty || "medium"
      );

      ApiResponseHandler.success(res, { questions });
    } catch (error: any) {
      logger.error("Quiz generation failed", { error });
      ApiResponseHandler.error(res, "AI_ERROR", error.message);
    }
  }

  static async generateSummary(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const { content, maxLength } = req.body;

      if (!content) {
        ApiResponseHandler.badRequest(res, "Content is required");
        return;
      }

      const summary = await aiService.generateSummary(content, maxLength || 200);
      ApiResponseHandler.success(res, { summary });
    } catch (error: any) {
      logger.error("Summary generation failed", { error });
      ApiResponseHandler.error(res, "AI_ERROR", error.message);
    }
  }
}


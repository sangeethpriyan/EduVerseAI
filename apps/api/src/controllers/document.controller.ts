import { Request, Response } from "express";
import { documentService } from "../services/document.service";
import { ApiResponseHandler } from "../utils/response";
import { logger } from "../utils/logger";

export class DocumentController {
  static async generateDocument(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const { type, templateData, generatedFor } = req.body;

      if (!type || !templateData || !generatedFor) {
        ApiResponseHandler.badRequest(res, "type, templateData, and generatedFor are required");
        return;
      }

      const document = await documentService.generateDocument(
        type,
        templateData,
        req.user.id,
        generatedFor
      );

      ApiResponseHandler.created(res, document);
    } catch (error: any) {
      logger.error("Document generation failed", { error });
      ApiResponseHandler.error(res, "GENERATION_FAILED", error.message);
    }
  }

  static async getDocument(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const { documentId } = req.params;
      const document = await documentService.getDocument(documentId, req.user.id);
      ApiResponseHandler.success(res, document);
    } catch (error: any) {
      logger.error("Failed to get document", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }

  static async getDocuments(req: Request, res: Response) {
    try {
      if (!req.user) {
        ApiResponseHandler.unauthorized(res);
        return;
      }

      const { type } = req.query;
      const documents = await documentService.getDocumentsForUser(
        req.user.id,
        type as string
      );
      ApiResponseHandler.success(res, documents);
    } catch (error: any) {
      logger.error("Failed to get documents", { error });
      ApiResponseHandler.error(res, "FETCH_FAILED", error.message);
    }
  }
}


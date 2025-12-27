import express, { Router } from "express";
import { DocumentController } from "../controllers/document.controller";
import { authMiddleware, requirePermission } from "../middleware/auth";
import { Permission } from "@eduverse/shared";

const router: Router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Generate document
router.post("/documents/generate", requirePermission(Permission.GENERATE_DOCUMENTS), DocumentController.generateDocument);

// Get documents
router.get("/documents", DocumentController.getDocuments);
router.get("/documents/:documentId", DocumentController.getDocument);

export default router;


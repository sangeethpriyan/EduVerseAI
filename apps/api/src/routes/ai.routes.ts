import express from "express";
import { AIController } from "../controllers/ai.controller";
import { authMiddleware, requirePermission } from "../middleware/auth";
import { Permission } from "@eduverse/shared";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Student AI chat
router.post("/ai/student-chat", requirePermission(Permission.USE_AI_ASSISTANT), AIController.chat);

// Teacher AI tools
router.post("/ai/generate-quiz", requirePermission(Permission.USE_AI_TOOLS), AIController.generateQuiz);
router.post("/ai/generate-summary", requirePermission(Permission.USE_AI_TOOLS), AIController.generateSummary);

// General chat (for teachers/admins)
router.post("/ai/chat", requirePermission(Permission.USE_AI_TOOLS), AIController.chat);

export default router;


import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  userId: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface IChatMessage extends Document {
  sessionId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
  }>;
  retrievedDocuments?: Array<{
    id: string;
    title: string;
    excerpt: string;
    relevanceScore: number;
  }>;
  timestamp: Date;
}

export interface IAIDocumentChunk extends Document {
  documentId: string;
  content: string;
  tokenCount: number;
  embeddingId?: string;
  startPosition?: number;
  endPosition?: number;
  createdAt: Date;
}

// Audit Log Schema
const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: String, required: true, index: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String, required: true },
    changes: { type: Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { collection: "auditLogs", timestamps: false }
);

// Chat Message Schema
const chatMessageSchema = new Schema<IChatMessage>(
  {
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
      },
    ],
    retrievedDocuments: [
      {
        id: String,
        title: String,
        excerpt: String,
        relevanceScore: Number,
      },
    ],
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { collection: "chatMessages", timestamps: false }
);

// Document Chunk Schema (for RAG)
const documentChunkSchema = new Schema<IAIDocumentChunk>(
  {
    documentId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    tokenCount: { type: Number, required: true },
    embeddingId: { type: String, index: true },
    startPosition: Number,
    endPosition: Number,
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "documentChunks", timestamps: false }
);

// Export models
export const AuditLog =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export const ChatMessage =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);

export const DocumentChunk =
  mongoose.models.DocumentChunk ||
  mongoose.model<IAIDocumentChunk>("DocumentChunk", documentChunkSchema);

export const mongooseModels = {
  AuditLog,
  ChatMessage,
  DocumentChunk,
};

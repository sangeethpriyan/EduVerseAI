import { Request } from "express";
import multer from "multer";
import * as path from "path";
import * as crypto from "crypto";
import { FILE_CONSTRAINTS } from "@eduverse/shared";
import { logger } from "../utils/logger";

// In production, would integrate with S3 or similar cloud storage
// For now, using local file system storage

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // In production, would upload to S3
    // For now, use local storage or temp directory
    cb(null, process.env.UPLOAD_DIR || "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  
  // Check file type
  const allowedTypes = [
    ...FILE_CONSTRAINTS.ALLOWED_UPLOAD_TYPES,
    ...FILE_CONSTRAINTS.ALLOWED_DOCUMENT_TYPES,
  ];

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${ext} is not allowed. Allowed types: ${allowedTypes.join(", ")}`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: FILE_CONSTRAINTS.MAX_FILE_SIZE,
  },
  fileFilter,
});

export class UploadService {
  async uploadFile(file: Express.Multer.File): Promise<{
    url: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }> {
    // Validate file size
    if (file.size > FILE_CONSTRAINTS.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${FILE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // In production, would upload to S3 and return public URL
    // For now, return local file path
    const fileUrl = `/uploads/${file.filename}`;

    logger.info("File uploaded", {
      fileName: file.filename,
      size: file.size,
      type: file.mimetype,
    });

    return {
      url: fileUrl,
      fileName: file.filename,
      fileSize: file.size,
      fileType: path.extname(file.originalname).slice(1),
    };
  }

  async uploadToS3(file: Express.Multer.File, bucket: string, key: string): Promise<string> {
    // Stub for S3 upload
    // In production, would use AWS SDK:
    // const s3 = new AWS.S3();
    // await s3.putObject({ Bucket: bucket, Key: key, Body: file.buffer }).promise();
    // return s3.getSignedUrl('getObject', { Bucket: bucket, Key: key });

    logger.info("S3 upload stub", { bucket, key, fileName: file.filename });
    return `https://s3.amazonaws.com/${bucket}/${key}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // In production, would delete from S3 or local storage
    logger.info("File deletion stub", { fileUrl });
  }
}

export const uploadService = new UploadService();


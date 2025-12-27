import { z } from "zod";

// Auth Schemas
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["student", "teacher", "admin", "super_admin"]),
});

export const OTPRequestSchema = z.object({
  email: z.string().email(),
});

export const VerifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

// Student
export const CourseProgressSchema = z.object({
  courseId: z.string().uuid(),
  progress: z.number().min(0).max(100),
  materialsCompleted: z.number().nonnegative(),
  totalMaterials: z.number().positive(),
});

export const AttendanceRecordSchema = z.object({
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  date: z.date(),
  status: z.enum(["present", "absent", "leave"]),
});

export const AssignmentSubmissionSchema = z.object({
  assignmentId: z.string().uuid(),
  studentId: z.string().uuid(),
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileSizeBytes: z.number().positive().max(10 * 1024 * 1024), // 10MB
  submittedAt: z.date(),
  contentHash: z.string(), // blockchain-like hash
});

// Teacher
export const CreateCourseSchema = z.object({
  code: z.string(),
  name: z.string().min(1),
  description: z.string(),
  credits: z.number().positive(),
  semester: z.number().positive(),
});

export const CreateMaterialSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1),
  type: z.enum(["pdf", "video", "quiz", "document"]),
  fileUrl: z.string().url(),
  duration: z.number().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const CreateAssignmentSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  dueDate: z.date(),
  maxScore: z.number().positive(),
});

export const MarkAttendanceSchema = z.object({
  courseId: z.string().uuid(),
  date: z.date(),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(["present", "absent", "leave"]),
    })
  ),
});

// Common
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type OTPRequest = z.infer<typeof OTPRequestSchema>;
export type VerifyOTP = z.infer<typeof VerifyOTPSchema>;
export type CourseProgress = z.infer<typeof CourseProgressSchema>;
export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;
export type AssignmentSubmission = z.infer<typeof AssignmentSubmissionSchema>;
export type CreateCourse = z.infer<typeof CreateCourseSchema>;
export type CreateMaterial = z.infer<typeof CreateMaterialSchema>;
export type CreateAssignment = z.infer<typeof CreateAssignmentSchema>;
export type MarkAttendance = z.infer<typeof MarkAttendanceSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;

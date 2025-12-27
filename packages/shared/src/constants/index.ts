export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  PERMISSION_DENIED: "PERMISSION_DENIED",
} as const;

export const ATTENDANCE_THRESHOLDS = {
  MINIMUM_PERCENTAGE: 75,
  WARNING_PERCENTAGE: 80,
  CRITICAL_PERCENTAGE: 70,
} as const;

export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_UPLOAD_TYPES: ["pdf", "doc", "docx", "txt", "xlsx", "xls"],
  ALLOWED_DOCUMENT_TYPES: [
    "pdf",
    "doc",
    "docx",
    "xlsx",
    "xls",
    "pptx",
    "ppt",
  ],
  ALLOWED_VIDEO_TYPES: ["mp4", "webm", "avi", "mkv"],
} as const;

export const AI_CONFIG = {
  MAX_CHUNK_SIZE: 512,
  EMBEDDING_MODEL: "text-embedding-3-small",
  COMPLETION_MODEL: "gpt-4-turbo-preview",
  MAX_CONTEXT_TOKENS: 8000,
  MAX_RESPONSE_TOKENS: 2000,
} as const;

export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 24 * 60 * 60, // 24 hours
  VERY_LONG: 7 * 24 * 60 * 60, // 7 days
} as const;

export const JWT_CONFIG = {
  EXPIRES_IN: "24h",
  REFRESH_EXPIRES_IN: "7d",
  ALGORITHM: "HS256",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const SEMESTER_MONTHS = {
  FIRST: [7, 8, 9, 10, 11, 12], // Jul-Dec
  SECOND: [1, 2, 3, 4, 5, 6], // Jan-Jun
} as const;

export const DOCUMENT_TEMPLATES = {
  ATTENDANCE_CERTIFICATE: "attendance_certificate",
  MARK_SHEET: "mark_sheet",
  BONAFIDE: "bonafide",
  HALL_TICKET: "hall_ticket",
  COURSE_COMPLETION: "course_completion",
} as const;

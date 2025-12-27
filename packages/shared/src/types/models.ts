export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface StudentOverview {
  student: {
    id: string;
    rollNo: string;
  };
  courses: any[];
  attendance: any[];
  fees: any;
  pendingAssignments: any[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface StudentProfile {
  id: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  address: string;
  city: string;
  state: string;
  pinCode: string;
  enrollmentDate: Date;
  semester: number;
  status: "active" | "inactive" | "suspended" | "graduated";
  parentEmail?: string;
  parentPhone?: string;
}

export interface TeacherProfile {
  id: string;
  empId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  qualifications: string[];
  expertise: string[];
  joinDate: Date;
  status: "active" | "inactive" | "on_leave";
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  semester: number;
  departmentId: string;
  teacherId: string;
  maxStudents: number;
  enrolledCount: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: Date;
  maxScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceStatus {
  studentId: string;
  courseId: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  riskLevel: "low" | "medium" | "high";
  riskPrediction?: string;
}

export interface FeeStructure {
  id: string;
  studentId: string;
  semester: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: Date;
  status: "pending" | "partial" | "paid" | "overdue";
  installments?: FeeInstallment[];
}

export interface FeeInstallment {
  id: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: "pending" | "paid" | "overdue";
}

export interface AuditLog {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
  retrievedDocuments?: {
    id: string;
    title: string;
    excerpt: string;
    relevanceScore: number;
  }[];
  timestamp: Date;
}

export interface AIDocument {
  id: string;
  title: string;
  content: string;
  source: "course_material" | "institutional" | "user_uploaded";
  uploadedBy: string;
  courseId?: string;
  fileUrl: string;
  chunks: {
    id: string;
    content: string;
    tokens: number;
    embeddingId?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

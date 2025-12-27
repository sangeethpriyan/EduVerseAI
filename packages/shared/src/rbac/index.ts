export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum Permission {
  // Student permissions
  VIEW_OWN_COURSES = "view_own_courses",
  VIEW_OWN_ASSIGNMENTS = "view_own_assignments",
  SUBMIT_ASSIGNMENT = "submit_assignment",
  VIEW_OWN_ATTENDANCE = "view_own_attendance",
  VIEW_OWN_FEES = "view_own_fees",
  USE_AI_ASSISTANT = "use_ai_assistant",

  // Teacher permissions
  CREATE_COURSE = "create_course",
  MANAGE_COURSE_MATERIALS = "manage_course_materials",
  CREATE_ASSIGNMENTS = "create_assignments",
  GRADE_ASSIGNMENTS = "grade_assignments",
  MARK_ATTENDANCE = "mark_attendance",
  ENTER_MARKS = "enter_marks",
  VIEW_STUDENT_ANALYTICS = "view_student_analytics",
  GENERATE_REPORTS = "generate_reports",
  USE_AI_TOOLS = "use_ai_tools",

  // Admin permissions
  MANAGE_STUDENTS = "manage_students",
  MANAGE_TEACHERS = "manage_teachers",
  MANAGE_COURSES = "manage_courses",
  VIEW_FINANCIAL_REPORTS = "view_financial_reports",
  MANAGE_FEES = "manage_fees",
  GENERATE_DOCUMENTS = "generate_documents",
  VIEW_ANALYTICS = "view_analytics",

  // Super Admin permissions
  MANAGE_ADMINS = "manage_admins",
  MANAGE_SYSTEM_CONFIG = "manage_system_config",
  VIEW_AUDIT_LOGS = "view_audit_logs",
  MANAGE_ROLES = "manage_roles",
  SYSTEM_SETTINGS = "system_settings",
  EXPORT_DATA = "export_data",
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.STUDENT]: [
    Permission.VIEW_OWN_COURSES,
    Permission.VIEW_OWN_ASSIGNMENTS,
    Permission.SUBMIT_ASSIGNMENT,
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.VIEW_OWN_FEES,
    Permission.USE_AI_ASSISTANT,
  ],
  [UserRole.TEACHER]: [
    Permission.CREATE_COURSE,
    Permission.MANAGE_COURSE_MATERIALS,
    Permission.CREATE_ASSIGNMENTS,
    Permission.GRADE_ASSIGNMENTS,
    Permission.MARK_ATTENDANCE,
    Permission.ENTER_MARKS,
    Permission.VIEW_STUDENT_ANALYTICS,
    Permission.GENERATE_REPORTS,
    Permission.USE_AI_TOOLS,
  ],
  [UserRole.ADMIN]: [
    Permission.MANAGE_STUDENTS,
    Permission.MANAGE_TEACHERS,
    Permission.MANAGE_COURSES,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.MANAGE_FEES,
    Permission.GENERATE_DOCUMENTS,
    Permission.VIEW_ANALYTICS,
  ],
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
};

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
}

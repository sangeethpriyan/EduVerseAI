import { prisma } from "@eduverse/db";
import { ATTENDANCE_THRESHOLDS, PaginatedResponse } from "@eduverse/shared";
import { logger } from "../utils/logger";

export class StudentService {
  async getEnrolledCourses(
    studentId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where: { studentId },
        include: {
          course: {
            select: {
              id: true,
              code: true,
              name: true,
              credits: true,
              teacher: {
                select: { userId: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { enrolledDate: "desc" },
      }),
      prisma.enrollment.count({ where: { studentId } }),
    ]);

    const courses = enrollments.map((e) => ({
      courseId: e.course.id,
      code: e.course.code,
      name: e.course.name,
      credits: e.course.credits,
      progress: e.progressPercent,
      status: e.status,
    }));

    return {
      data: courses,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  async getCourseDetails(studentId: string, courseId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
      include: {
        course: {
          include: {
            materials: {
              select: {
                id: true,
                title: true,
                type: true,
                fileUrl: true,
                difficultyLevel: true,
              },
            },
            assignments: {
              select: {
                id: true,
                title: true,
                dueDate: true,
                maxScore: true,
              },
            },
            teacher: {
              select: {
                user: {
                  select: { firstName: true, lastName: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error("Course not found");
    }

    return {
      courseId: enrollment.course.id,
      courseName: enrollment.course.name,
      courseCode: enrollment.course.code,
      progress: enrollment.progressPercent,
      materials: enrollment.course.materials,
      assignments: enrollment.course.assignments,
      teacher: enrollment.course.teacher.user,
    };
  }

  async getAttendanceStatus(studentId: string, courseId?: string) {
    let whereClause: any = { studentId };
    if (courseId) {
      whereClause.courseId = courseId;
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        course: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    // Group by course
    const byCourse: Record<string, any> = {};

    attendanceRecords.forEach((record) => {
      if (!byCourse[record.courseId]) {
        byCourse[record.courseId] = {
          courseId: record.course.id,
          courseName: record.course.name,
          totalClasses: 0,
          attendedClasses: 0,
          absentClasses: 0,
          leaves: 0,
        };
      }

      byCourse[record.courseId].totalClasses += 1;

      if (record.status === "present") {
        byCourse[record.courseId].attendedClasses += 1;
      } else if (record.status === "absent") {
        byCourse[record.courseId].absentClasses += 1;
      } else if (record.status === "leave") {
        byCourse[record.courseId].leaves += 1;
      }
    });

    // Calculate percentage and risk level
    Object.keys(byCourse).forEach((courseId) => {
      const course = byCourse[courseId];
      course.percentage = course.totalClasses
        ? Math.round((course.attendedClasses / course.totalClasses) * 100)
        : 0;

      // Risk prediction
      if (course.percentage < ATTENDANCE_THRESHOLDS.CRITICAL_PERCENTAGE) {
        course.riskLevel = "high";
        const classesNeeded = Math.ceil(
          course.totalClasses * (ATTENDANCE_THRESHOLDS.MINIMUM_PERCENTAGE / 100) -
            course.attendedClasses
        );
        course.riskPrediction = `Need ${classesNeeded} more attendances to reach 75%`;
      } else if (course.percentage < ATTENDANCE_THRESHOLDS.WARNING_PERCENTAGE) {
        course.riskLevel = "medium";
      } else {
        course.riskLevel = "low";
      }
    });

    return Object.values(byCourse);
  }

  async getFeeStatus(studentId: string) {
    const feeStructures = await prisma.feeStructure.findMany({
      where: { studentId },
      include: {
        installments: {
          orderBy: { dueDate: "asc" },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
      orderBy: { semester: "asc" },
    });

    return {
      fees: feeStructures.map((fee) => ({
        semester: fee.semester,
        totalAmount: fee.totalAmount,
        paidAmount: fee.paidAmount,
        dueAmount: fee.dueAmount,
        status: fee.status,
        dueDate: fee.dueDate,
        installments: fee.installments,
        payments: fee.payments,
      })),
      totalOwed: feeStructures.reduce((sum, f) => sum + f.dueAmount, 0),
      overdueAmount: feeStructures
        .filter((f) => f.status === "overdue")
        .reduce((sum, f) => sum + f.dueAmount, 0),
    };
  }

  async getAssignments(studentId: string, courseId: string) {
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId,
      },
      include: {
        submissions: {
          where: { studentId },
          select: {
            id: true,
            fileName: true,
            submittedAt: true,
            score: true,
            feedback: true,
          },
        },
      },
    });

    return assignments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate,
      maxScore: a.maxScore,
      submission: a.submissions[0] || null,
    }));
  }
}

export const studentService = new StudentService();

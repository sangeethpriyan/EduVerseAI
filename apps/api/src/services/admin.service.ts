import { prisma } from "@eduverse/db";
import { logger } from "../utils/logger";

export class AdminService {
  async getOverview() {
    // Get overall statistics
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      totalFees,
      collectedFees,
      pendingFees,
    ] = await Promise.all([
      prisma.student.count({ where: { status: "active" } }),
      prisma.teacher.count({ where: { status: "active" } }),
      prisma.course.count(),
      prisma.feeStructure.aggregate({
        _sum: { totalAmount: true },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "completed" },
      }),
      prisma.feeStructure.aggregate({
        _sum: { dueAmount: true },
      }),
    ]);

    // Get defaulters
    const defaulters = await prisma.feeStructure.findMany({
      where: {
        status: "overdue",
      },
      include: {
        student: {
          select: {
            rollNo: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    // Get scholarships
    const scholarships = await prisma.feeStructure.aggregate({
      _sum: { scholarhipAmount: true },
      where: {
        scholarhipAmount: { gt: 0 },
      },
    });

    // Get dropout risk students (simplified - would use ML model in production)
    const dropoutRisk = await this.getDropoutRiskStudents();

    return {
      stats: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalFees: totalFees._sum.totalAmount || 0,
        collectedFees: collectedFees._sum.amount || 0,
        pendingFees: pendingFees._sum.dueAmount || 0,
        scholarships: scholarships._sum.scholarhipAmount || 0,
        defaulters: defaulters.length,
      },
      defaulters: defaulters.map((f) => ({
        studentId: f.studentId,
        rollNo: f.student.rollNo,
        name: `${f.student.user.firstName} ${f.student.user.lastName}`,
        dueAmount: f.dueAmount,
        semester: f.semester,
      })),
      dropoutRisk,
    };
  }

  async getDropoutRiskStudents(limit: number = 20) {
    // Simplified risk calculation based on attendance and performance
    // In production, this would use a trained ML model
    const students = await prisma.student.findMany({
      where: { status: "active" },
      include: {
        attendance: true,
        marks: true,
        fees: {
          where: { status: "overdue" },
        },
      },
      take: limit,
    });

    return students
      .map((student) => {
        const totalClasses = student.attendance.length;
        const attendedClasses = student.attendance.filter(
          (a) => a.status === "present"
        ).length;
        const attendancePercent =
          totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;

        const averageMarks =
          student.marks.length > 0
            ? student.marks.reduce(
                (sum, m) => sum + (m.totalMarks || 0),
                0
              ) / student.marks.length
            : 100;

        // Risk score calculation (simplified)
        let riskScore = 0;
        if (attendancePercent < 75) riskScore += 40;
        if (averageMarks < 50) riskScore += 40;
        if (student.fees.length > 0) riskScore += 20;

        return {
          studentId: student.id,
          rollNo: student.rollNo,
          attendancePercent: Math.round(attendancePercent),
          averageMarks: Math.round(averageMarks),
          riskScore,
        };
      })
      .filter((s) => s.riskScore > 50)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit);
  }

  async getStudents(filters?: {
    status?: string;
    semester?: number;
    search?: string;
  }) {
    const students = await prisma.student.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.semester && { semester: filters.semester }),
        ...(filters?.search && {
          OR: [
            { rollNo: { contains: filters.search, mode: "insensitive" } },
            {
              user: {
                OR: [
                  {
                    firstName: {
                      contains: filters.search,
                      mode: "insensitive",
                    },
                  },
                  {
                    lastName: {
                      contains: filters.search,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
          ],
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        fees: {
          take: 1,
          orderBy: { semester: "desc" },
        },
      },
      orderBy: { rollNo: "asc" },
    });

    return students.map((student) => ({
      id: student.id,
      rollNo: student.rollNo,
      email: student.user.email,
      name: `${student.user.firstName} ${student.user.lastName}`,
      phone: student.user.phone,
      semester: student.semester,
      status: student.status,
      enrollmentDate: student.enrollmentDate,
      feeStatus: student.fees[0]?.status || "unknown",
    }));
  }

  async createStudent(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    rollNo: string;
    dateOfBirth?: Date;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    semester?: number;
    parentEmail?: string;
    parentPhone?: string;
  }) {
    // Check if roll number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { rollNo: data.rollNo },
    });

    if (existingStudent) {
      throw new Error("Roll number already exists");
    }

    // Create user account
    const { PasswordService } = await import("../utils/password");
    const hashedPassword = await PasswordService.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "student",
      },
    });

    // Create student profile
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        rollNo: data.rollNo,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        semester: data.semester || 1,
        parentEmail: data.parentEmail,
        parentPhone: data.parentPhone,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info("Student created", { studentId: student.id, rollNo: data.rollNo });
    return student;
  }

  async promoteStudents(fromSemester: number, toSemester: number) {
    // Get students in the from semester
    const students = await prisma.student.findMany({
      where: {
        semester: fromSemester,
        status: "active",
      },
      include: {
        marks: true,
      },
    });

    const promoted: string[] = [];
    const detained: string[] = [];

    for (const student of students) {
      // Check if student passed (simplified logic)
      const failedCourses = student.marks.filter(
        (mark) => (mark.totalMarks || 0) < 40
      );

      if (failedCourses.length === 0) {
        // Promote
        await prisma.student.update({
          where: { id: student.id },
          data: { semester: toSemester },
        });
        promoted.push(student.id);
      } else {
        // Detain
        detained.push(student.id);
      }
    }

    logger.info("Students promoted", {
      fromSemester,
      toSemester,
      promoted: promoted.length,
      detained: detained.length,
    });

    return {
      promoted: promoted.length,
      detained: detained.length,
      studentIds: { promoted, detained },
    };
  }

  async createFeeStructure(
    studentId: string,
    data: {
      semester: number;
      totalAmount: number;
      dueDate: Date;
      installments?: Array<{ amount: number; dueDate: Date }>;
    }
  ) {
    const feeStructure = await prisma.feeStructure.create({
      data: {
        studentId,
        semester: data.semester,
        totalAmount: data.totalAmount,
        dueAmount: data.totalAmount,
        dueDate: data.dueDate,
        installments: data.installments
          ? {
              create: data.installments.map((inst) => ({
                amount: inst.amount,
                dueDate: inst.dueDate,
              })),
            }
          : undefined,
      },
      include: {
        installments: true,
      },
    });

    logger.info("Fee structure created", {
      feeStructureId: feeStructure.id,
      studentId,
    });

    return feeStructure;
  }

  async getAnalytics() {
    const [
      attendanceStats,
      facultyWorkload,
      placementStats,
      naacCompliance,
    ] = await Promise.all([
      this.getAttendanceHeatmap(),
      this.getFacultyWorkload(),
      this.getPlacementStats(),
      this.getNAACCompliance(),
    ]);

    return {
      attendance: attendanceStats,
      facultyWorkload,
      placement: placementStats,
      naacCompliance,
    };
  }

  async getAttendanceHeatmap() {
    // Get attendance by department/subject
    const attendance = await prisma.attendance.groupBy({
      by: ["courseId"],
      _count: {
        id: true,
      },
      where: {
        status: "present",
      },
    });

    // This is simplified - in production would aggregate by department
    return {
      data: attendance.map((a) => ({
        courseId: a.courseId,
        presentCount: a._count.id,
      })),
    };
  }

  async getFacultyWorkload() {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        courses: {
          include: {
            enrollments: true,
          },
        },
      },
    });

    return teachers.map((teacher) => ({
      teacherId: teacher.id,
      empId: teacher.empId,
      name: `${teacher.user.firstName} ${teacher.user.lastName}`,
      courseCount: teacher.courses.length,
      studentCount: teacher.courses.reduce(
        (sum, course) => sum + course.enrollments.length,
        0
      ),
    }));
  }

  async getPlacementStats() {
    // Simplified - in production would have a Placement model
    return {
      totalEligible: 0,
      placed: 0,
      conversionRate: 0,
    };
  }

  async getNAACCompliance() {
    // Simplified compliance scoring
    const [
      studentsCount,
      teachersCount,
      coursesCount,
      avgAttendance,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.course.count(),
      prisma.attendance.aggregate({
        _avg: {
          id: true, // Simplified - would calculate actual percentage
        },
      }),
    ]);

    // Simplified compliance score calculation
    const score = Math.min(
      100,
      Math.round(
        (studentsCount > 0 ? 25 : 0) +
          (teachersCount > 0 ? 25 : 0) +
          (coursesCount > 0 ? 25 : 0) +
          (avgAttendance._avg.id ? 25 : 0)
      )
    );

    return {
      score,
      criteria: {
        studentStrength: studentsCount,
        facultyStrength: teachersCount,
        courseOffering: coursesCount,
        attendance: avgAttendance._avg.id || 0,
      },
    };
  }
}

export const adminService = new AdminService();


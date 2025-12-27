import { prisma } from "@eduverse/db";
import { logger } from "../utils/logger";

export class TeacherService {
  async getOverview(teacherId: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        courses: {
          include: {
            enrollments: {
              select: { id: true },
            },
            assignments: {
              where: {
                submissions: {
                  some: {
                    score: null,
                  },
                },
              },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's classes (simplified - in production, would query actual class schedules)
    const todaysClasses = teacher.courses.length;

    // Count pending grading
    const pendingGrading = teacher.courses.reduce(
      (sum, course) => sum + course.assignments.length,
      0
    );

    // Calculate risk alerts (students with low attendance/performance)
    const riskAlerts = await this.getRiskAlerts(teacherId);

    return {
      teacher: {
        id: teacher.id,
        empId: teacher.empId,
        name: `${teacher.user.firstName} ${teacher.user.lastName}`,
        department: teacher.department,
        designation: teacher.designation,
      },
      stats: {
        assignedCourses: teacher.courses.length,
        todaysClasses,
        pendingGrading,
        totalStudents: teacher.courses.reduce(
          (sum, course) => sum + course.enrollments.length,
          0
        ),
      },
      riskAlerts,
    };
  }

  async getRiskAlerts(teacherId: string) {
    const courses = await prisma.course.findMany({
      where: { teacherId },
      include: {
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                rollNo: true,
                userId: true,
              },
            },
          },
        },
      },
    });

    const alerts: any[] = [];

    for (const course of courses) {
      for (const enrollment of course.enrollments) {
        // Fetch attendance records for this specific student-course combination
        const attendance = await prisma.attendance.findMany({
          where: {
            studentId: enrollment.studentId,
            courseId: course.id,
          },
        });

        const totalClasses = attendance.length;
        const attendedClasses = attendance.filter((a) => a.status === "present").length;
        const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

        if (percentage < 75) {
          alerts.push({
            courseId: course.id,
            courseName: course.name,
            studentId: enrollment.studentId,
            studentRollNo: enrollment.student.rollNo,
            issue: "low_attendance",
            percentage: Math.round(percentage),
          });
        }
      }
    }

    return alerts;
  }

  async getCourses(teacherId: string) {
    const courses = await prisma.course.findMany({
      where: { teacherId },
      include: {
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
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
        },
        materials: {
          orderBy: { uploadedAt: "desc" },
          take: 5,
        },
        assignments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return courses.map((course) => ({
      id: course.id,
      code: course.code,
      name: course.name,
      description: course.description,
      credits: course.credits,
      enrolledCount: course.enrollments.length,
      recentMaterials: course.materials,
      recentAssignments: course.assignments,
    }));
  }

  async getCourseDetails(teacherId: string, courseId: string) {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId,
      },
      include: {
        materials: {
          orderBy: { uploadedAt: "desc" },
        },
        assignments: {
          include: {
            submissions: {
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
            },
          },
          orderBy: { createdAt: "desc" },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
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
        },
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    return course;
  }

  async createCourse(
    teacherId: string,
    data: {
      code: string;
      name: string;
      description?: string;
      credits: number;
      semester: number;
      startDate: Date;
      endDate: Date;
      maxStudents?: number;
    }
  ) {
    const course = await prisma.course.create({
      data: {
        ...data,
        teacherId,
        maxStudents: data.maxStudents || 60,
      },
      include: {
        teacher: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    logger.info("Course created", { courseId: course.id, teacherId });
    return course;
  }

  async createMaterial(
    teacherId: string,
    courseId: string,
    data: {
      title: string;
      description?: string;
      type: string;
      fileUrl: string;
      fileSizeBytes?: number;
      duration?: number;
    }
  ) {
    // Verify teacher owns the course
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId },
    });

    if (!course) {
      throw new Error("Course not found or unauthorized");
    }

    const material = await prisma.courseMaterial.create({
      data: {
        ...data,
        courseId,
      },
    });

    // TODO: Generate AI summary and keywords using OpenAI
    // This would be done async or in a background job

    logger.info("Course material created", { materialId: material.id, courseId });
    return material;
  }

  async createAssignment(
    teacherId: string,
    courseId: string,
    data: {
      title: string;
      description: string;
      instructions?: string;
      dueDate: Date;
      maxScore?: number;
      submissionType?: string;
    }
  ) {
    // Verify teacher owns the course
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId },
    });

    if (!course) {
      throw new Error("Course not found or unauthorized");
    }

    const assignment = await prisma.assignment.create({
      data: {
        ...data,
        courseId,
        teacherId,
        maxScore: data.maxScore || 100,
        submissionType: data.submissionType || "file",
      },
    });

    logger.info("Assignment created", { assignmentId: assignment.id, courseId });
    return assignment;
  }

  async markAttendance(
    teacherId: string,
    courseId: string,
    classDate: Date,
    attendanceRecords: Array<{
      studentId: string;
      status: "present" | "absent" | "leave";
    }>
  ) {
    // Verify teacher owns the course
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId },
    });

    if (!course) {
      throw new Error("Course not found or unauthorized");
    }

    // Create/update attendance records
    const records = await Promise.all(
      attendanceRecords.map((record) =>
        prisma.attendance.upsert({
          where: {
            studentId_courseId_date: {
              studentId: record.studentId,
              courseId,
              date: classDate,
            },
          },
          update: {
            status: record.status,
            markedAt: new Date(),
          },
          create: {
            studentId: record.studentId,
            courseId,
            date: classDate,
            status: record.status,
          },
        })
      )
    );

    logger.info("Attendance marked", {
      courseId,
      date: classDate,
      count: records.length,
    });

    return records;
  }

  async enterMarks(
    teacherId: string,
    courseId: string,
    marks: Array<{
      studentId: string;
      internalMarks?: number;
      externalMarks?: number;
      comments?: string;
    }>
  ) {
    // Verify teacher owns the course
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId },
    });

    if (!course) {
      throw new Error("Course not found or unauthorized");
    }

    const results = await Promise.all(
      marks.map(async (mark) => {
        const totalMarks =
          (mark.internalMarks || 0) + (mark.externalMarks || 0);
        const grade = this.calculateGrade(totalMarks);

        return prisma.studentMark.upsert({
          where: {
            studentId_courseId: {
              studentId: mark.studentId,
              courseId,
            },
          },
          update: {
            internalMarks: mark.internalMarks,
            externalMarks: mark.externalMarks,
            totalMarks,
            grade,
            comments: mark.comments,
            enteredAt: new Date(),
          },
          create: {
            studentId: mark.studentId,
            courseId,
            teacherId,
            internalMarks: mark.internalMarks,
            externalMarks: mark.externalMarks,
            totalMarks,
            grade,
            comments: mark.comments,
          },
        });
      })
    );

    logger.info("Marks entered", { courseId, count: results.length });
    return results;
  }

  private calculateGrade(totalMarks: number): string {
    if (totalMarks >= 90) return "A+";
    if (totalMarks >= 80) return "A";
    if (totalMarks >= 70) return "B+";
    if (totalMarks >= 60) return "B";
    if (totalMarks >= 50) return "C+";
    if (totalMarks >= 40) return "C";
    return "F";
  }

  async gradeAssignment(
    teacherId: string,
    assignmentId: string,
    submissionId: string,
    score: number,
    feedback?: string
  ) {
    const submission = await prisma.assignmentSubmission.findFirst({
      where: {
        id: submissionId,
        assignmentId,
      },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission) {
      throw new Error("Submission not found");
    }

    // Verify that the teacher owns the assignment's course
    if (submission.assignment.course.teacherId !== teacherId) {
      throw new Error("Unauthorized: You don't have permission to grade this assignment");
    }

    if (score > submission.assignment.maxScore) {
      throw new Error("Score cannot exceed max score");
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score,
        feedback,
        gradedAt: new Date(),
      },
    });

    logger.info("Assignment graded", { submissionId, score });
    return updated;
  }

  async getReports(teacherId: string, filters?: {
    courseId?: string;
    semester?: number;
    reportType?: string;
  }) {
    // This would generate various reports
    // For now, return basic analytics
    const courses = await prisma.course.findMany({
      where: {
        teacherId,
        ...(filters?.courseId && { id: filters.courseId }),
        ...(filters?.semester && { semester: filters.semester }),
      },
      include: {
        enrollments: true,
        assignments: {
          include: {
            submissions: true,
          },
        },
        studentMarks: true,
      },
    });

    return {
      courses: courses.map((course) => ({
        id: course.id,
        name: course.name,
        enrollmentCount: course.enrollments.length,
        assignmentCount: course.assignments.length,
        averageScore: this.calculateAverageScore(course.studentMarks),
      })),
    };
  }

  private calculateAverageScore(marks: any[]): number {
    if (marks.length === 0) return 0;
    const sum = marks.reduce((acc, mark) => acc + (mark.totalMarks || 0), 0);
    return sum / marks.length;
  }
}

export const teacherService = new TeacherService();


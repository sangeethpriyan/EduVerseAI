import { prisma } from "../src/index";
import { passwordService } from "../../apps/api/src/utils/password";
import { UserRole } from "@eduverse/shared";

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (be careful in production!)
  await prisma.auditLog.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatSession.deleteMany({});
  await prisma.documentChunk.deleteMany({});
  await prisma.aiDocument.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.feeInstallment.deleteMany({});
  await prisma.feeStructure.deleteMany({});
  await prisma.studentMark.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.assignmentSubmission.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.courseMaterial.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✓ Cleared existing data");

  // Create admin user
  const adminPassword = await passwordService.hashPassword("admin123");
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@eduverse.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  // Create teacher users
  const teacherPassword = await passwordService.hashPassword("teacher123");
  const teacher1 = await prisma.user.create({
    data: {
      email: "teacher1@eduverse.com",
      password: teacherPassword,
      firstName: "Dr.",
      lastName: "Smith",
      role: UserRole.TEACHER,
      emailVerified: true,
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: "teacher2@eduverse.com",
      password: teacherPassword,
      firstName: "Prof.",
      lastName: "Johnson",
      role: UserRole.TEACHER,
      emailVerified: true,
    },
  });

  // Create teacher profiles
  await prisma.teacher.create({
    data: {
      userId: teacher1.id,
      empId: "EMP001",
      department: "Computer Science",
      designation: "Associate Professor",
      qualifications: ["B.Tech", "M.Tech", "PhD"],
      expertise: ["Data Structures", "Algorithms", "Database Systems"],
    },
  });

  await prisma.teacher.create({
    data: {
      userId: teacher2.id,
      empId: "EMP002",
      department: "Computer Science",
      designation: "Assistant Professor",
      qualifications: ["B.Tech", "M.Tech"],
      expertise: ["Web Development", "Cloud Computing"],
    },
  });

  // Create student users
  const studentPassword = await passwordService.hashPassword("student123");
  const students = [];

  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.create({
      data: {
        email: `student${i}@eduverse.com`,
        password: studentPassword,
        firstName: `Student`,
        lastName: `${i}`,
        role: UserRole.STUDENT,
        emailVerified: true,
      },
    });

    const studentProfile = await prisma.student.create({
      data: {
        userId: student.id,
        rollNo: `CS2024${String(i).padStart(3, "0")}`,
        dateOfBirth: new Date(2004, Math.random() * 12, Math.random() * 28),
        gender: i % 2 === 0 ? "male" : "female",
        address: `${i} Main Street`,
        city: "Springfield",
        state: "State",
        pinCode: "123456",
        semester: 1,
        status: "active",
        parentEmail: `parent${i}@email.com`,
        parentPhone: `+91 9876543${String(i).padStart(3, "0")}`,
      },
    });

    students.push({ user: student, profile: studentProfile });
  }

  console.log("✓ Created users (1 admin, 2 teachers, 5 students)");

  // Create courses
  const now = new Date();
  const courseStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const courseEndDate = new Date(now.getFullYear(), now.getMonth() + 4, 30);

  const course1 = await prisma.course.create({
    data: {
      code: "CS101",
      name: "Data Structures",
      description: "Learn fundamental data structures and algorithms",
      credits: 4,
      semester: 1,
      departmentId: "CS",
      teacherId: teacher1.id,
      maxStudents: 60,
      startDate: courseStartDate,
      endDate: courseEndDate,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      code: "CS102",
      name: "Web Development",
      description: "Modern web development with React and Node.js",
      credits: 3,
      semester: 1,
      departmentId: "CS",
      teacherId: teacher2.id,
      maxStudents: 60,
      startDate: courseStartDate,
      endDate: courseEndDate,
    },
  });

  console.log("✓ Created courses");

  // Enroll students in courses
  for (const student of students) {
    await prisma.enrollment.create({
      data: {
        studentId: student.profile.id,
        courseId: course1.id,
        status: "active",
        progressPercent: Math.floor(Math.random() * 100),
      },
    });

    await prisma.enrollment.create({
      data: {
        studentId: student.profile.id,
        courseId: course2.id,
        status: "active",
        progressPercent: Math.floor(Math.random() * 100),
      },
    });
  }

  console.log("✓ Enrolled students in courses");

  // Create course materials
  await prisma.courseMaterial.create({
    data: {
      courseId: course1.id,
      title: "Chapter 1: Arrays and Lists",
      description: "Introduction to arrays and linked lists",
      type: "pdf",
      fileUrl: "https://example.com/materials/chapter1.pdf",
      fileSizeBytes: 2048576,
      aiGeneratedSummary:
        "This chapter covers arrays, dynamic arrays, and linked lists with implementations.",
      keywords: ["arrays", "lists", "data structures"],
      difficultyLevel: "medium",
    },
  });

  // Create assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      courseId: course1.id,
      teacherId: teacher1.id,
      title: "Assignment 1: Implement a Stack",
      description: "Implement a stack data structure with push, pop, and peek operations",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 100,
    },
  });

  // Add attendance records
  for (const student of students) {
    for (let day = 1; day <= 10; day++) {
      const status = Math.random() > 0.2 ? "present" : "absent";

      await prisma.attendance.create({
        data: {
          studentId: student.profile.id,
          courseId: course1.id,
          date: new Date(now.getFullYear(), now.getMonth(), day),
          status,
        },
      });
    }
  }

  console.log("✓ Created attendance records");

  // Create fee structures
  for (const student of students) {
    await prisma.feeStructure.create({
      data: {
        studentId: student.profile.id,
        semester: 1,
        totalAmount: 100000,
        paidAmount: Math.random() > 0.5 ? 50000 : 100000,
        dueAmount: Math.random() > 0.5 ? 50000 : 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: Math.random() > 0.5 ? "pending" : "partial",
      },
    });
  }

  console.log("✓ Created fee structures");

  // Create marks
  for (const student of students) {
    await prisma.studentMark.create({
      data: {
        studentId: student.profile.id,
        courseId: course1.id,
        teacherId: teacher1.id,
        internalMarks: Math.floor(Math.random() * 30),
        externalMarks: Math.floor(Math.random() * 70),
        totalMarks: null,
        grade: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)],
    });
  }

  console.log("✓ Created student marks");

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

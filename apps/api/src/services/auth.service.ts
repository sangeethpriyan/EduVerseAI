import { prisma } from "@eduverse/db";
import { PasswordService, jwtService, generatePermissionsForRole } from "../utils/index";
import { UserRole } from "@eduverse/shared";
import { logger } from "../utils/logger";

export class AuthService {
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole
  ) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await PasswordService.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });

    logger.info("User registered", { userId: user.id, email });

    // Create role-specific profile
    if (role === UserRole.STUDENT) {
      await prisma.student.create({
        data: {
          userId: user.id,
          rollNo: `STU-${Date.now()}`,
        },
      });
    } else if (role === UserRole.TEACHER) {
      await prisma.teacher.create({
        data: {
          userId: user.id,
          empId: `EMP-${Date.now()}`,
          department: "General",
          designation: "Lecturer",
        },
      });
    }

    const permissions = generatePermissionsForRole(role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken: jwtService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
        permissions,
      }),
      refreshToken: jwtService.generateRefreshToken(user.id),
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await PasswordService.verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    logger.info("User logged in", { userId: user.id, email });

    const permissions = generatePermissionsForRole(user.role as UserRole);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken: jwtService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
        permissions,
      }),
      refreshToken: jwtService.generateRefreshToken(user.id),
    };
  }

  async studentLogin(rollNo: string, password: string) {
    // Look up student by roll number
    const student = await prisma.student.findUnique({
      where: { rollNo },
      include: {
        user: true,
      },
    });

    if (!student || !student.user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await PasswordService.verifyPassword(password, student.user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    if (student.user.role !== UserRole.STUDENT) {
      throw new Error("Invalid credentials for student portal");
    }

    logger.info("Student logged in", { userId: student.user.id, rollNo });

    const permissions = generatePermissionsForRole(UserRole.STUDENT);

    return {
      user: {
        id: student.user.id,
        email: student.user.email,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        role: student.user.role,
      },
      accessToken: jwtService.generateToken({
        userId: student.user.id,
        email: student.user.email,
        role: UserRole.STUDENT,
        permissions,
      }),
      refreshToken: jwtService.generateRefreshToken(student.user.id),
    };
  }

  async refreshToken(refreshToken: string) {
    const { userId } = jwtService.verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const permissions = generatePermissionsForRole(user.role as UserRole);

    return {
      accessToken: jwtService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
        permissions,
      }),
      refreshToken: jwtService.generateRefreshToken(user.id),
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

export const authService = new AuthService();

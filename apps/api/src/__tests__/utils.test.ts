import { passwordService } from "../../utils/password.js";
import { jwtService, generatePermissionsForRole } from "../../utils/jwt.js";
import { UserRole } from "@eduverse/shared";

describe("JWT Service", () => {
  test("should generate and verify token", () => {
    const payload = {
      userId: "test-user-123",
      email: "test@example.com",
      role: UserRole.STUDENT,
      permissions: generatePermissionsForRole(UserRole.STUDENT),
    };

    const token = jwtService.generateToken(payload);
    expect(token).toBeDefined();

    const verified = jwtService.verifyToken(token);
    expect(verified.userId).toBe(payload.userId);
    expect(verified.email).toBe(payload.email);
    expect(verified.role).toBe(UserRole.STUDENT);
  });

  test("should throw error for invalid token", () => {
    expect(() => jwtService.verifyToken("invalid-token")).toThrow();
  });

  test("should generate refresh token", () => {
    const refreshToken = jwtService.generateRefreshToken("user-123");
    expect(refreshToken).toBeDefined();

    const verified = jwtService.verifyRefreshToken(refreshToken);
    expect(verified.userId).toBe("user-123");
  });
});

describe("Password Service", () => {
  test("should hash and verify password", async () => {
    const password = "testPassword123";
    const hashed = await passwordService.hashPassword(password);

    expect(hashed).not.toBe(password);
    const isValid = await passwordService.verifyPassword(password, hashed);
    expect(isValid).toBe(true);
  });

  test("should reject incorrect password", async () => {
    const password = "testPassword123";
    const hashed = await passwordService.hashPassword(password);

    const isValid = await passwordService.verifyPassword("wrongPassword", hashed);
    expect(isValid).toBe(false);
  });

  test("should generate OTP", () => {
    const otp = passwordService.generateOTP(6);
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  test("should generate hash", () => {
    const content = "test-content";
    const hash = passwordService.generateContentHash(content);
    expect(hash).toHaveLength(64); // SHA-256 hex
  });
});

import jwt from "jsonwebtoken";
import { JWTPayload, UserRole, Permission, ROLE_PERMISSIONS } from "@eduverse/shared";

export class JWTService {
  private readonly secret = process.env.JWT_SECRET || "default-secret";
  private readonly refreshSecret = process.env.REFRESH_TOKEN_SECRET || "default-refresh-secret";
  private readonly expiresIn = process.env.JWT_EXPIRES_IN || "24h";
  private readonly refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

  generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    });
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.secret) as JWTPayload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  verifyRefreshToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, this.refreshSecret) as { userId: string };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
}

export const jwtService = new JWTService();

export function generatePermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

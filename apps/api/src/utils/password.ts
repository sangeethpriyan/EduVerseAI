import bcryptjs from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 10;

export class PasswordService {
  static async hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  static generateOTP(length: number = 6): string {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  static generateHash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  static generateContentHash(content: string | Buffer): string {
    const hash = crypto.createHash("sha256");
    hash.update(content);
    return hash.digest("hex");
  }
}

export const passwordService = new PasswordService();

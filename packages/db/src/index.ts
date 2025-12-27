import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";

export const prisma = new PrismaClient();

let mongooseConnection: typeof mongoose | null = null;

export async function connectMongoDB(): Promise<typeof mongoose> {
  if (mongooseConnection) {
    return mongooseConnection;
  }

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/eduverse";

  await mongoose.connect(mongoUri);
  mongooseConnection = mongoose;

  return mongoose;
}

export async function disconnectMongoDB(): Promise<void> {
  if (mongooseConnection) {
    await mongooseConnection.disconnect();
    mongooseConnection = null;
  }
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

export { mongooseModels } from "./models/index";
export * from "./models/index";

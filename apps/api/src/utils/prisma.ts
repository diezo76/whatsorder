import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Vérifier que DATABASE_URL est défini
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

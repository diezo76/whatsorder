import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Vérifier que DATABASE_URL est défini
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined');
  throw new Error('DATABASE_URL environment variable is not set');
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Gestion des erreurs de connexion
prisma.$connect().catch((error) => {
  console.error('❌ Failed to connect to database:', error);
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

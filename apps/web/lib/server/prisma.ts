import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Vérifier que DATABASE_URL est défini
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined');
  throw new Error('DATABASE_URL environment variable is not set');
}

// Désactiver les prepared statements pour éviter les conflits avec le Connection Pooler
// Ajouter ?pgbouncer=true à la DATABASE_URL si ce n'est pas déjà fait
const databaseUrl = process.env.DATABASE_URL.includes('pgbouncer=true')
  ? process.env.DATABASE_URL
  : `${process.env.DATABASE_URL}${process.env.DATABASE_URL.includes('?') ? '&' : '?'}pgbouncer=true`;

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

// Gestion des erreurs de connexion
prisma.$connect().catch((error) => {
  console.error('❌ Failed to connect to database:', error);
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

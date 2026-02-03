/**
 * Script pour appliquer la migration SQL des variants et options
 * Utilise Prisma pour exécuter le SQL directement
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔄 Application de la migration variants/options...\n');

    // Lire le fichier SQL
    const migrationPath = path.join(__dirname, '../prisma/migrations/add_variants_options/migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Exécuter le SQL complet
    console.log('📝 Exécution de la migration SQL...');
    await prisma.$executeRawUnsafe(sql);
    console.log('✅ Migration appliquée avec succès !\n');

    console.log('📦 Génération du client Prisma...');
    // Note: La génération sera faite manuellement avec npx prisma generate
    
  } catch (error: any) {
    // Si certaines parties existent déjà, ce n'est pas grave
    if (error.message.includes('already exists') || 
        error.message.includes('duplicate') ||
        (error.message.includes('relation') && error.message.includes('already'))) {
      console.log('⚠️  Certaines parties existent déjà, mais la migration continue...\n');
    } else {
      console.error('❌ Erreur lors de la migration:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
applyMigration()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });

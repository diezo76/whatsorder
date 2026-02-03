#!/usr/bin/env node

/**
 * Script pour appliquer la migration SQL des variants et options
 * Utilise Prisma pour exécuter le SQL directement
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function parseSQL(sql) {
  const statements = [];
  let currentStatement = '';
  let inDoBlock = false;
  let inComment = false;

  const lines = sql.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Ignorer les commentaires
    if (trimmed.startsWith('--')) {
      continue;
    }
    
    // Détecter le début d'un bloc DO $$
    if (trimmed.startsWith('DO $$')) {
      inDoBlock = true;
      currentStatement = line + '\n';
      continue;
    }
    
    // Détecter la fin d'un bloc DO $$
    if (inDoBlock && trimmed === 'END $$;') {
      currentStatement += line;
      statements.push(currentStatement.trim());
      currentStatement = '';
      inDoBlock = false;
      continue;
    }
    
    // Si on est dans un bloc DO, ajouter la ligne
    if (inDoBlock) {
      currentStatement += line + '\n';
      continue;
    }
    
    // Pour les autres instructions, chercher le point-virgule
    currentStatement += line + '\n';
    
    if (trimmed.endsWith(';')) {
      const stmt = currentStatement.trim();
      if (stmt && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      currentStatement = '';
    }
  }
  
  // Ajouter la dernière instruction si elle existe
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements.filter(s => s.length > 0);
}

async function applyMigration() {
  try {
    console.log('🔄 Application de la migration variants/options...\n');

    // Lire le fichier SQL
    const migrationPath = path.join(__dirname, '../prisma/migrations/add_variants_options/migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Parser le SQL en instructions individuelles
    const statements = parseSQL(sql);
    console.log(`📝 ${statements.length} instructions SQL à exécuter...\n`);

    // Exécuter chaque instruction
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`[${i + 1}/${statements.length}] Exécution...`);
        await prisma.$executeRawUnsafe(statement);
        console.log(`✅ [${i + 1}/${statements.length}] Succès\n`);
      } catch (error) {
        // Ignorer les erreurs "already exists" car on utilise IF NOT EXISTS
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('already exists') || 
            errorMsg.includes('duplicate') ||
            (errorMsg.includes('relation') && errorMsg.includes('already')) ||
            errorMsg.includes('constraint') && errorMsg.includes('already')) {
          console.log(`⚠️  [${i + 1}/${statements.length}] Ignoré (déjà existant)\n`);
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Erreur:`);
          console.error(`   ${statement.substring(0, 100)}...`);
          console.error(`   ${error.message}\n`);
          // Continuer avec les autres instructions
        }
      }
    }

    console.log('✅ Migration terminée !\n');
    
  } catch (error) {
    console.error('❌ Erreur fatale lors de la migration:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
applyMigration()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    console.log('\n📦 N\'oubliez pas d\'exécuter: npx prisma generate');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });

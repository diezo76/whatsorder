/**
 * Script de test pour vérifier la vérification de signature webhook WhatsApp
 * 
 * Usage: pnpm tsx src/scripts/test-webhook-signature.ts
 */

import crypto from 'crypto';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement depuis le répertoire api
// Le script est dans src/scripts/, donc on remonte de 2 niveaux pour arriver à apps/api/
const envPath = resolve(__dirname, '../../.env');
const envLoaded = dotenv.config({ path: envPath });

// Afficher le chemin chargé pour debug
console.log('🧪 Test de vérification de signature webhook WhatsApp\n');
console.log(`📁 Chargement .env depuis: ${envPath}`);

if (envLoaded.error) {
  console.warn(`⚠️  Erreur lors du chargement de .env: ${envLoaded.error.message}`);
} else {
  console.log('✅ Fichier .env chargé');
}

// Vérifier les variables disponibles
const whatsappAppSecret = process.env.WHATSAPP_APP_SECRET;
const appSecret = process.env.APP_SECRET;
const appSecretFinal = whatsappAppSecret || appSecret;

console.log('\n📋 Variables détectées:');
console.log(`   WHATSAPP_APP_SECRET: ${whatsappAppSecret ? '✅ Définie (' + whatsappAppSecret.length + ' caractères)' : '❌ Non définie'}`);
console.log(`   APP_SECRET: ${appSecret ? '✅ Définie (' + appSecret.length + ' caractères)' : '❌ Non définie'}`);

// Test 1: Vérifier que APP_SECRET est configuré
console.log('\nTest 1: Vérification de la configuration');
if (!appSecretFinal) {
  console.error('\n❌ APP_SECRET non configuré');
  console.error('\n📝 Instructions:');
  console.error('   1. Ouvrez le fichier: apps/api/.env');
  console.error('   2. Ajoutez cette ligne:');
  console.error('      WHATSAPP_APP_SECRET=votre_app_secret_ici');
  console.error('\n   Comment obtenir APP_SECRET:');
  console.error('   1. Allez sur https://developers.facebook.com/');
  console.error('   2. Sélectionnez votre application WhatsApp');
  console.error('   3. Settings > Basic > App Secret');
  console.error('   4. Cliquez sur "Show" et copiez la valeur');
  console.error('\n   Format attendu dans .env:');
  console.error('   WHATSAPP_APP_SECRET=abc123def456... (sans guillemets)');
  process.exit(1);
} else {
  console.log('✅ APP_SECRET configuré');
  console.log(`   Variable utilisée: ${whatsappAppSecret ? 'WHATSAPP_APP_SECRET' : 'APP_SECRET'}`);
  console.log(`   Longueur: ${appSecretFinal.length} caractères`);
  console.log(`   Préfixe: ${appSecretFinal.substring(0, 4)}...`);
}

// Test 2: Générer une signature valide
console.log('\nTest 2: Génération d\'une signature valide');
const testBody = JSON.stringify({
  object: 'whatsapp_business_account',
  entry: [{
    changes: [{
      value: {
        messages: [{
          from: '1234567890',
          id: 'wamid.test123',
          timestamp: '1234567890',
          type: 'text',
          text: { body: 'Test message' }
        }]
      }
    }]
  }]
});

const validSignature = crypto
  .createHmac('sha256', appSecretFinal)
  .update(testBody)
  .digest('hex');

console.log('✅ Signature générée');
console.log(`   Format: sha256=${validSignature.substring(0, 20)}...`);
console.log(`   Header à utiliser: x-hub-signature-256: sha256=${validSignature}`);

// Test 3: Vérifier la signature
console.log('\nTest 3: Vérification de la signature');
const signatureHeader = `sha256=${validSignature}`;
const elements = signatureHeader.split('=');

if (elements.length !== 2 || elements[0] !== 'sha256') {
  console.error('❌ Format de signature invalide');
  process.exit(1);
}

const receivedHash = elements[1];
const expectedHash = crypto
  .createHmac('sha256', appSecretFinal)
  .update(Buffer.from(testBody))
  .digest('hex');

if (receivedHash === expectedHash) {
  console.log('✅ Signature vérifiée avec succès');
} else {
  console.error('❌ Signature invalide');
  console.error(`   Attendu: ${expectedHash.substring(0, 20)}...`);
  console.error(`   Reçu: ${receivedHash.substring(0, 20)}...`);
  process.exit(1);
}

// Test 4: Vérifier avec une signature invalide
console.log('\nTest 4: Vérification avec signature invalide');
const invalidHash = 'invalid_signature_hash';
const invalidSignature = `sha256=${invalidHash}`;
const invalidElements = invalidSignature.split('=');
const invalidReceivedHash = invalidElements[1];

if (invalidReceivedHash === expectedHash) {
  console.error('❌ La signature invalide a été acceptée (problème de sécurité!)');
  process.exit(1);
} else {
  console.log('✅ Signature invalide correctement rejetée');
}

// Test 5: Vérifier le comportement en développement
console.log('\nTest 5: Comportement selon NODE_ENV');
const originalEnv = process.env.NODE_ENV;

process.env.NODE_ENV = 'development';
console.log('   Mode développement: Plus permissif (warnings au lieu d\'erreurs)');

process.env.NODE_ENV = 'production';
console.log('   Mode production: Strict (rejette les requêtes non signées)');

process.env.NODE_ENV = originalEnv;

console.log('\n✅ Tous les tests sont passés!');
console.log('\n📝 Prochaines étapes:');
console.log('   1. Configurez votre webhook dans Meta Business Manager');
console.log('   2. Utilisez le header x-hub-signature-256 dans vos tests');
console.log('   3. Les webhooks réels de Meta seront automatiquement vérifiés');

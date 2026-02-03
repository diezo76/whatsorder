/**
 * Script pour vérifier la connexion WhatsApp du restaurant
 * 
 * Usage: pnpm tsx src/scripts/check-whatsapp-connection.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWhatsAppConnection() {
  console.log('🔍 Vérification de la connexion WhatsApp\n');
  console.log('=' .repeat(60));

  try {
    // 1. Vérifier le restaurant "nile bites"
    console.log('\n1️⃣ VÉRIFICATION DU RESTAURANT');
    console.log('-'.repeat(60));
    
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { name: { contains: 'nile bites', mode: 'insensitive' } },
          { slug: 'nile-bites' },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        whatsappNumber: true,
        whatsappApiToken: true,
        whatsappBusinessId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!restaurant) {
      console.error('❌ Restaurant "nile bites" non trouvé');
      return;
    }

    const tokenStatus = restaurant.whatsappApiToken && 
                       restaurant.whatsappApiToken !== '' && 
                       restaurant.whatsappApiToken !== 'your-access-token'
      ? '✅ CONFIGURÉ'
      : '❌ NON CONFIGURÉ';

    const businessIdStatus = restaurant.whatsappBusinessId && 
                             restaurant.whatsappBusinessId !== '' && 
                             restaurant.whatsappBusinessId !== 'your-phone-number-id'
      ? '✅ CONFIGURÉ'
      : '❌ NON CONFIGURÉ';

    const connectionStatus = (restaurant.whatsappApiToken && 
                              restaurant.whatsappApiToken !== '' && 
                              restaurant.whatsappApiToken !== 'your-access-token' &&
                              restaurant.whatsappBusinessId && 
                              restaurant.whatsappBusinessId !== '' && 
                              restaurant.whatsappBusinessId !== 'your-phone-number-id')
      ? '✅ CONNECTÉ'
      : '❌ DÉCONNECTÉ';

    console.log(`Restaurant ID: ${restaurant.id}`);
    console.log(`Nom: ${restaurant.name}`);
    console.log(`Slug: ${restaurant.slug}`);
    console.log(`Téléphone: ${restaurant.phone}`);
    console.log(`WhatsApp Number: ${restaurant.whatsappNumber || 'Non configuré'}`);
    console.log(`\nStatut WhatsApp Token: ${tokenStatus}`);
    console.log(`Statut Business ID: ${businessIdStatus}`);
    console.log(`\n🎯 STATUT CONNEXION: ${connectionStatus}`);
    
    // Vérifier si le restaurant est actif (via une autre requête si nécessaire)
    const restaurantFull = await prisma.restaurant.findUnique({
      where: { id: restaurant.id },
    });
    if (restaurantFull && 'isActive' in restaurantFull) {
      console.log(`Restaurant actif: ${(restaurantFull as any).isActive ? '✅ Oui' : '❌ Non'}`);
    }

    if (restaurant.whatsappApiToken) {
      console.log(`Token length: ${restaurant.whatsappApiToken.length} caractères`);
      console.log(`Token preview: ${restaurant.whatsappApiToken.substring(0, 10)}...`);
    }

    if (restaurant.whatsappBusinessId) {
      console.log(`Business ID: ${restaurant.whatsappBusinessId}`);
    }

    // 2. Vérifier l'utilisateur admin
    console.log('\n\n2️⃣ VÉRIFICATION DE L\'UTILISATEUR ADMIN');
    console.log('-'.repeat(60));

    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@whatsorder.com' },
      select: {
        id: true,
        email: true,
        name: true,
        restaurantId: true,
        role: true,
        isActive: true,
      },
    });

    if (adminUser) {
      console.log(`User ID: ${adminUser.id}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Nom: ${adminUser.name}`);
      console.log(`Restaurant ID: ${adminUser.restaurantId || 'Non associé'}`);
      console.log(`Rôle: ${adminUser.role}`);
      console.log(`Actif: ${adminUser.isActive ? '✅ Oui' : '❌ Non'}`);

      if (adminUser.restaurantId !== restaurant.id) {
        console.warn('\n⚠️ ATTENTION: L\'utilisateur admin n\'est pas associé au restaurant "nile bites"');
      }
    } else {
      console.warn('⚠️ Utilisateur admin@whatsorder.com non trouvé');
    }

    // 3. Statistiques des conversations
    console.log('\n\n3️⃣ STATISTIQUES DES CONVERSATIONS');
    console.log('-'.repeat(60));

    const conversations = await prisma.conversation.findMany({
      where: {
        restaurantId: restaurant.id,
      },
      select: {
        id: true,
        status: true,
        lastMessageAt: true,
      },
    });

    const totalConversations = conversations.length;
    const openConversations = conversations.filter(c => c.status === 'OPEN').length;
    const lastMessageDate = conversations.length > 0
      ? conversations.reduce((latest, conv) => 
          conv.lastMessageAt > latest ? conv.lastMessageAt : latest,
          conversations[0].lastMessageAt
        )
      : null;

    console.log(`Total conversations: ${totalConversations}`);
    console.log(`Conversations ouvertes: ${openConversations}`);
    console.log(`Dernier message: ${lastMessageDate ? lastMessageDate.toISOString() : 'Aucun'}`);

    // 4. Résumé et recommandations
    console.log('\n\n4️⃣ RÉSUMÉ ET RECOMMANDATIONS');
    console.log('='.repeat(60));

    if (connectionStatus === '❌ DÉCONNECTÉ') {
      console.log('\n❌ Le restaurant est DÉCONNECTÉ de WhatsApp');
      console.log('\n📝 Pour reconnecter:');
      console.log('   1. Allez dans Meta Business Manager');
      console.log('   2. Obtenez votre WhatsApp Business ID (Phone Number ID)');
      console.log('   3. Obtenez votre Access Token');
      console.log('   4. Mettez à jour via l\'interface admin: /dashboard/settings');
      console.log('      ou utilisez le script: scripts/reconnect-whatsapp-restaurant.sql');
    } else {
      console.log('\n✅ Le restaurant est CONNECTÉ à WhatsApp');
      console.log('\n📝 Prochaines étapes:');
      console.log('   1. Vérifier que le webhook est configuré dans Meta Business Manager');
      console.log('   2. Tester en envoyant un message WhatsApp au restaurant');
      console.log('   3. Vérifier les logs du serveur backend');
      console.log('   4. Vérifier l\'inbox dans /dashboard/inbox');
    }

  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWhatsAppConnection();

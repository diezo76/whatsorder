import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllRecentOrders() {
  try {
    console.log('🔍 Vérification de TOUTES les commandes récentes...\n');

    // Vérifier toutes les commandes créées aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('📦 Commandes créées aujourd\'hui (depuis minuit):');
    console.log('='.repeat(80));

    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (todayOrders.length === 0) {
      console.log('❌ Aucune commande trouvée aujourd\'hui\n');
    } else {
      console.log(`✅ ${todayOrders.length} commande(s) trouvée(s) aujourd'hui:\n`);
      todayOrders.forEach((order, index) => {
        console.log(`\n${index + 1}. Commande ${order.orderNumber}`);
        console.log(`   ID: ${order.id}`);
        console.log(`   Statut: ${order.status}`);
        console.log(`   Total: ${order.total} EGP`);
        console.log(`   Type de livraison: ${order.deliveryType}`);
        console.log(`   Restaurant: ${order.restaurant.name} (${order.restaurant.slug})`);
        console.log(`   Restaurant ID: ${order.restaurant.id}`);
        console.log(`   Client: ${order.customer.name} - ${order.customer.phone}`);
        console.log(`   Source: ${order.source}`);
        console.log(`   Créée le: ${order.createdAt.toLocaleString('fr-FR')}`);
        console.log(`   Items: ${order.items.length}`);
        order.items.forEach((item, itemIndex) => {
          console.log(`      ${itemIndex + 1}. ${item.quantity}x ${item.name} - ${item.unitPrice} EGP (${item.subtotal} EGP)`);
        });
      });
    }

    // Vérifier les 10 dernières commandes toutes périodes confondues
    console.log('\n\n📋 Les 10 dernières commandes (toutes périodes):');
    console.log('='.repeat(80));

    const lastOrders = await prisma.order.findMany({
      include: {
        restaurant: {
          select: {
            name: true,
            slug: true,
          },
        },
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    if (lastOrders.length === 0) {
      console.log('❌ Aucune commande trouvée dans la base de données\n');
    } else {
      lastOrders.forEach((order, index) => {
        const itemsText = order.items
          .map((item) => `${item.quantity}x ${item.name}`)
          .join(', ');

        const createdAt = new Date(order.createdAt);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));

        console.log(`\n${index + 1}. ${order.orderNumber}`);
        console.log(`   Restaurant: ${order.restaurant.name} (${order.restaurant.slug})`);
        console.log(`   Client: ${order.customer.name} (${order.customer.phone})`);
        console.log(`   Statut: ${order.status}`);
        console.log(`   Total: ${order.total} EGP`);
        console.log(`   Source: ${order.source}`);
        console.log(`   Items (${order.items.length}): ${itemsText}`);
        console.log(`   Créée: ${createdAt.toLocaleString('fr-FR')} (il y a ${diffHours}h)`);
      });
    }

    // Vérifier les commandes du restaurant "nile-bites"
    console.log('\n\n🍽️ Commandes du restaurant "nile-bites":');
    console.log('='.repeat(80));

    const nileBitesRestaurant = await prisma.restaurant.findUnique({
      where: { slug: 'nile-bites' },
      include: {
        orders: {
          include: {
            customer: {
              select: {
                name: true,
                phone: true,
              },
            },
            items: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!nileBitesRestaurant) {
      console.log('❌ Restaurant "nile-bites" non trouvé\n');
    } else {
      console.log(`Restaurant ID: ${nileBitesRestaurant.id}`);
      console.log(`Total commandes: ${nileBitesRestaurant.orders.length}\n`);

      if (nileBitesRestaurant.orders.length === 0) {
        console.log('❌ Aucune commande pour ce restaurant\n');
      } else {
        nileBitesRestaurant.orders.forEach((order, index) => {
          const createdAt = new Date(order.createdAt);
          const now = new Date();
          const diffHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));

          console.log(`\n${index + 1}. ${order.orderNumber}`);
          console.log(`   Statut: ${order.status}`);
          console.log(`   Client: ${order.customer.name} (${order.customer.phone})`);
          console.log(`   Total: ${order.total} EGP`);
          console.log(`   Source: ${order.source}`);
          console.log(`   Créée: ${createdAt.toLocaleString('fr-FR')} (il y a ${diffHours}h)`);
        });
      }
    }

    console.log('\n✅ Diagnostic terminé\n');
  } catch (error: any) {
    console.error('❌ Erreur lors du diagnostic:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllRecentOrders();

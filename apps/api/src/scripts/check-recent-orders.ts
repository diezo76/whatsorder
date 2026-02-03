import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRecentOrders() {
  try {
    console.log('🔍 Vérification des commandes récentes...\n');

    // 1. Vérifier les commandes créées dans les dernières 24 heures
    console.log('📦 Commandes créées dans les dernières 24 heures:');
    console.log('='.repeat(80));

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 heures
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
      take: 20,
    });

    if (recentOrders.length === 0) {
      console.log('❌ Aucune commande trouvée dans les dernières 24 heures\n');
    } else {
      recentOrders.forEach((order, index) => {
        console.log(`\n${index + 1}. Commande ${order.orderNumber}`);
        console.log(`   ID: ${order.id}`);
        console.log(`   Statut: ${order.status}`);
        console.log(`   Total: ${order.total} EGP`);
        console.log(`   Type de livraison: ${order.deliveryType}`);
        console.log(`   Restaurant: ${order.restaurant.name} (${order.restaurant.slug})`);
        console.log(`   Client: ${order.customer.name} - ${order.customer.phone}`);
        console.log(`   Source: ${order.source}`);
        console.log(`   Créée le: ${order.createdAt.toLocaleString('fr-FR')}`);
        console.log(`   Items: ${order.items.length}`);
        order.items.forEach((item, itemIndex) => {
          console.log(`      ${itemIndex + 1}. ${item.quantity}x ${item.name} - ${item.unitPrice} EGP`);
        });
      });
    }

    // 2. Compter les commandes par restaurant
    console.log('\n\n📊 Statistiques par restaurant:');
    console.log('='.repeat(80));

    const restaurants = await prisma.restaurant.findMany({
      include: {
        orders: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    restaurants.forEach((restaurant) => {
      const totalOrders = restaurant.orders.length;
      const pendingOrders = restaurant.orders.filter((o) => o.status === 'PENDING').length;
      const ordersLast24h = restaurant.orders.filter(
        (o) => o.createdAt >= new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;

      console.log(`\n${restaurant.name} (${restaurant.slug}):`);
      console.log(`   Total commandes: ${totalOrders}`);
      console.log(`   En attente: ${pendingOrders}`);
      console.log(`   Dernières 24h: ${ordersLast24h}`);
    });

    // 3. Dernières commandes avec détails complets
    console.log('\n\n📋 Dernières commandes avec détails:');
    console.log('='.repeat(80));

    const lastOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
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
      console.log('❌ Aucune commande trouvée\n');
    } else {
      lastOrders.forEach((order, index) => {
        const itemsText = order.items
          .map((item) => `${item.quantity}x ${item.name}`)
          .join(', ');

        console.log(`\n${index + 1}. ${order.orderNumber}`);
        console.log(`   Restaurant: ${order.restaurant.name}`);
        console.log(`   Client: ${order.customer.name} (${order.customer.phone})`);
        console.log(`   Statut: ${order.status}`);
        console.log(`   Total: ${order.total} EGP`);
        console.log(`   Items (${order.items.length}): ${itemsText}`);
        console.log(`   Créée: ${order.createdAt.toLocaleString('fr-FR')}`);
      });
    }

    console.log('\n✅ Diagnostic terminé\n');
  } catch (error: any) {
    console.error('❌ Erreur lors du diagnostic:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentOrders();

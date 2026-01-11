import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  customer: {
    name: string;
    phone: string;
  };
  deliveryType: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

// Convertir les données en CSV
function convertToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(',');
  const dataRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Échapper les guillemets et virgules
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
}

// Export Commandes en CSV
export async function exportOrdersCSV(orders: Order[], period: string) {
  try {
    const data = orders.map(order => ({
      'Numéro': order.orderNumber,
      'Date': format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr }),
      'Client': order.customer.name,
      'Téléphone': order.customer.phone,
      'Type': getDeliveryTypeLabel(order.deliveryType),
      'Statut': getStatusLabel(order.status),
      'Articles': order.items.length,
      'Total (EGP)': order.total
    }));

    const csv = convertToCSV(data, [
      'Numéro',
      'Date',
      'Client',
      'Téléphone',
      'Type',
      'Statut',
      'Articles',
      'Total (EGP)'
    ]);

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const fileName = `commandes_${period}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    saveAs(blob, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting orders CSV:', error);
    throw new Error('Erreur lors de l\'export CSV');
  }
}

// Export Top Items en CSV
export async function exportTopItemsCSV(items: TopItem[], period: string) {
  try {
    const data = items.map((item, index) => ({
      'Rang': index + 1,
      'Plat': item.name,
      'Quantité Vendue': item.quantity,
      'Revenus (EGP)': item.revenue
    }));

    const csv = convertToCSV(data, [
      'Rang',
      'Plat',
      'Quantité Vendue',
      'Revenus (EGP)'
    ]);

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const fileName = `top_plats_${period}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    saveAs(blob, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting top items CSV:', error);
    throw new Error('Erreur lors de l\'export CSV');
  }
}

// Export Revenus en CSV
export async function exportRevenueCSV(data: RevenueData[], period: string) {
  try {
    const csvData = data.map(item => ({
      'Date': format(new Date(item.date), 'dd/MM/yyyy', { locale: fr }),
      'Revenus (EGP)': item.revenue,
      'Nombre de Commandes': item.orders
    }));

    const csv = convertToCSV(csvData, [
      'Date',
      'Revenus (EGP)',
      'Nombre de Commandes'
    ]);

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const fileName = `revenus_${period}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    saveAs(blob, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting revenue CSV:', error);
    throw new Error('Erreur lors de l\'export CSV');
  }
}

// Export Rapport Complet (toutes les données)
export async function exportCompleteReport(
  stats: any,
  _orders: Order[],
  topItems: TopItem[],
  revenueData: RevenueData[],
  period: string
) {
  try {
    // Section 1: Statistiques générales
    const statsData = [
      ['RAPPORT ANALYTICS - NILE BITES', ''],
      ['Période', period === 'today' ? "Aujourd'hui" : period === 'week' ? '7 derniers jours' : '30 derniers jours'],
      ['Date du rapport', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })],
      ['', ''],
      ['KPI', 'Valeur'],
      ['Revenus totaux (EGP)', stats.revenue.value],
      ['Nombre de commandes', stats.orders.value],
      ['Nouveaux clients', stats.newCustomers.value],
      ['Taux de conversion (%)', stats.conversionRate.value],
      ['Panier moyen (EGP)', stats.averageOrderValue.value],
      ['Temps moyen de traitement (min)', stats.avgProcessingTime.value],
      ['', ''],
      ['', ''],
      ['TOP 10 DES PLATS', ''],
      ['Plat', 'Quantité', 'Revenus (EGP)'],
      ...topItems.slice(0, 10).map(item => [item.name, item.quantity, item.revenue]),
      ['', ''],
      ['', ''],
      ['ÉVOLUTION DES REVENUS', ''],
      ['Date', 'Revenus (EGP)', 'Commandes'],
      ...revenueData.map(item => [
        format(new Date(item.date), 'dd/MM/yyyy', { locale: fr }),
        item.revenue,
        item.orders
      ])
    ];

    const csv = statsData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const fileName = `rapport_complet_${period}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    saveAs(blob, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting complete report:', error);
    throw new Error('Erreur lors de l\'export du rapport');
  }
}

// Helpers
function getDeliveryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    DELIVERY: 'Livraison',
    PICKUP: 'À emporter',
    DINE_IN: 'Sur place'
  };
  return labels[type] || type;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En Attente',
    CONFIRMED: 'Confirmée',
    PREPARING: 'En Préparation',
    READY: 'Prête',
    OUT_FOR_DELIVERY: 'En Livraison',
    DELIVERED: 'Livrée',
    COMPLETED: 'Complétée',
    CANCELLED: 'Annulée'
  };
  return labels[status] || status;
}

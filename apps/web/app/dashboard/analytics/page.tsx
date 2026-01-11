'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  Target,
  Download,
  RefreshCw
} from 'lucide-react';
import RevenueChart from '@/components/analytics/RevenueChart';
import TopItemsChart from '@/components/analytics/TopItemsChart';
import DeliveryTypesPieChart from '@/components/analytics/DeliveryTypesPieChart';
import ExportModal from '@/components/analytics/ExportModal';

// Types
interface DashboardStats {
  revenue: { value: number; change: number; previous: number };
  orders: { value: number; change: number; previous: number };
  newCustomers: { value: number };
  conversionRate: { value: number };
  averageOrderValue: { value: number };
  avgProcessingTime: { value: number };
}

interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

interface TopItem {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  revenue: number;
}

type Period = 'today' | 'week' | 'month' | 'custom';

export default function AnalyticsPage() {
  // États
  const [period, setPeriod] = useState<Period>('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Données
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [deliveryTypesData, setDeliveryTypesData] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // Chargement initial
  useEffect(() => {
    loadAnalytics();
  }, [period]);

  // Charger toutes les données
  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Convertir period en paramètre date pour l'API orders
      const dateParam = period === 'month' ? 'month' : period === 'week' ? 'week' : 'today';

      // Appels parallèles
      const [statsRes, revenueRes, topItemsRes, deliveryTypesRes, ordersRes] = await Promise.all([
        api.get(`/analytics/dashboard-stats?period=${period}`),
        api.get(`/analytics/revenue-chart?period=${period === 'today' ? '7days' : '30days'}`),
        api.get(`/analytics/top-items?period=${period}&limit=10`),
        api.get(`/analytics/delivery-types?period=${period}`),
        api.get(`/orders?date=${dateParam}&limit=1000`)
      ]);

      setStats(statsRes.data.stats);
      setRevenueData(revenueRes.data.data);
      setTopItems(topItemsRes.data.items);
      setDeliveryTypesData(deliveryTypesRes.data.data);
      setAllOrders(ordersRes.data.orders || ordersRes.data || []);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    toast.success('Données mises à jour ✓');
  };

  // Export CSV
  const handleExportCSV = () => {
    setShowExportModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">
              Suivez les performances de votre restaurant
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filtres de période */}
            <div className="flex items-center gap-2 bg-white border rounded-lg p-1">
              {[
                { value: 'today', label: "Aujourd'hui" },
                { value: 'week', label: '7 jours' },
                { value: 'month', label: '30 jours' }
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value as Period)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    period === p.value
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Bouton Rafraîchir */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Rafraîchir</span>
            </button>

            {/* Bouton Export */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <KPICard
              title="Revenus"
              value={`${stats.revenue.value.toFixed(2)} EGP`}
              change={stats.revenue.change}
              icon={<DollarSign className="w-6 h-6" />}
              color="orange"
            />
            <KPICard
              title="Commandes"
              value={stats.orders.value.toString()}
              change={stats.orders.change}
              icon={<ShoppingBag className="w-6 h-6" />}
              color="blue"
            />
            <KPICard
              title="Nouveaux Clients"
              value={stats.newCustomers.value.toString()}
              icon={<Users className="w-6 h-6" />}
              color="green"
            />
            <KPICard
              title="Taux de Conversion"
              value={`${stats.conversionRate.value.toFixed(1)}%`}
              icon={<Target className="w-6 h-6" />}
              color="purple"
            />
            <KPICard
              title="Panier Moyen"
              value={`${stats.averageOrderValue.value.toFixed(2)} EGP`}
              icon={<DollarSign className="w-6 h-6" />}
              color="yellow"
            />
            <KPICard
              title="Temps Moyen"
              value={`${stats.avgProcessingTime.value} min`}
              icon={<Clock className="w-6 h-6" />}
              color="gray"
            />
          </div>
        ) : null}

        {/* Graphes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Évolution des Revenus</h3>
            <RevenueChart data={revenueData} loading={loading} />
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Types de Livraison</h3>
            <DeliveryTypesPieChart data={deliveryTypesData} loading={loading} />
          </div>
        </div>

        {/* Graphe Top Items - Full Width */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 des Plats Vendus</h3>
          <TopItemsChart items={topItems} loading={loading} />
        </div>

      </div>

      {/* Modal Export */}
      {showExportModal && stats && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          period={period}
          stats={stats}
          orders={allOrders}
          topItems={topItems}
          revenueData={revenueData}
        />
      )}
    </div>
  );
}

// Composant KPI Card
interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: 'orange' | 'blue' | 'green' | 'purple' | 'yellow' | 'gray';
}

function KPICard({ title, value, change, icon, color }: KPICardProps) {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive && <TrendingUp className="w-4 h-4 text-green-600" />}
              {isNegative && <TrendingDown className="w-4 h-4 text-red-600" />}
              <span className={`text-sm font-medium ${
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
              }`}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs période précédente</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, DollarSign, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  loading?: boolean;
}

function StatCard({ title, value, icon: Icon, trend, loading }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-slate-200 animate-pulse rounded mt-2" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
          )}
          {trend && !loading && (
            <p className="text-xs text-slate-500 mt-1">{trend}</p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

interface DashboardStats {
  revenue: {
    value: number;
    change: number;
    previous: number;
  };
  orders: {
    value: number;
    change: number;
    previous: number;
  };
  newCustomers: {
    value: number;
  };
  conversionRate: {
    value: number;
  };
  averageOrderValue: {
    value: number;
  };
  avgProcessingTime: {
    value: number;
  };
}

export default function DashboardPage() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les stats du dashboard
        const [statsResponse, conversationsResponse] = await Promise.all([
          api.get('/analytics/dashboard-stats?period=today'),
          api.get('/conversations'),
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }

        // Compter les messages non lus
        if (conversationsResponse.data.success) {
          const conversations = conversationsResponse.data.conversations || [];
          const unreadCount = conversations.reduce((sum: number, conv: any) => {
            return sum + (conv.unreadCount || 0);
          }, 0);
          setUnreadMessages(unreadCount);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Formater les valeurs
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatChange = (change: number) => {
    if (change === 0) return null;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const formatTrend = (change: number, period: string = 'hier') => {
    if (change === 0) return null;
    const sign = change > 0 ? '+' : '';
    return `${sign}${Math.abs(change).toFixed(1)}% vs ${period}`;
  };

  const dashboardStats = [
    {
      title: 'Commandes du jour',
      value: stats?.orders.value.toString() || '0',
      icon: ShoppingBag,
      trend: stats?.orders.change !== undefined 
        ? formatTrend(stats.orders.change) || `${stats.orders.previous} hier`
        : undefined,
      loading: !stats,
    },
    {
      title: 'Revenus du jour',
      value: stats?.revenue.value ? formatCurrency(stats.revenue.value) : '0 EGP',
      icon: DollarSign,
      trend: stats?.revenue.change !== undefined
        ? formatTrend(stats.revenue.change) || `${formatCurrency(stats.revenue.previous)} hier`
        : undefined,
      loading: !stats,
    },
    {
      title: 'Clients actifs',
      value: stats?.newCustomers.value.toString() || '0',
      icon: Users,
      trend: stats?.newCustomers.value 
        ? `${stats.newCustomers.value} nouveau${stats.newCustomers.value > 1 ? 'x' : ''} aujourd'hui`
        : undefined,
      loading: !stats,
    },
    {
      title: 'Messages non lus',
      value: unreadMessages.toString(),
      icon: MessageSquare,
      trend: unreadMessages > 0 ? `${unreadMessages} message${unreadMessages > 1 ? 's' : ''} non lu${unreadMessages > 1 ? 's' : ''}` : undefined,
      loading: false,
    },
  ];

  return (
    <div className="h-full">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Tableau de bord
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            loading={stat.loading}
          />
        ))}
      </div>
    </div>
  );
}

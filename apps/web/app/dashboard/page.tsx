'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Users,
  Star,
  ArrowUpRight,
  Clock,
  Package,
  Truck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface DashboardStats {
  revenue: { value: number; change: number; previous: number };
  orders: { value: number; change: number; previous: number };
  newCustomers: { value: number };
  conversionRate: { value: number };
  averageOrderValue: { value: number };
  avgProcessingTime: { value: number } | number;
}

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 1200;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, isInView]);

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString('fr-FR')}{suffix}
    </span>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  loading?: boolean;
  delay?: number;
}

function KPICard({ title, value, numericValue, prefix, suffix, trend, trendLabel, icon: Icon, color, loading, delay = 0 }: KPICardProps) {
  const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'group-hover:ring-blue-200' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'group-hover:ring-emerald-200' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'group-hover:ring-purple-200' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', ring: 'group-hover:ring-orange-200' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="group relative bg-white rounded-xl border border-[#e5e5e5] p-5 hover:border-[#d4d4d4] hover:shadow-sm transition-all duration-200 cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-[#737373]">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-[#f5f5f5] animate-pulse rounded-md" />
          ) : (
            <p className="text-[28px] font-semibold text-[#0a0a0a] tracking-tight leading-none">
              {numericValue !== undefined ? (
                <AnimatedNumber value={numericValue} prefix={prefix} suffix={suffix} />
              ) : (
                value
              )}
            </p>
          )}
          {trend !== undefined && !loading && (
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-0.5 text-[12px] font-medium ${
                trend >= 0 ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend >= 0 ? '+' : ''}{Math.abs(trend).toFixed(1)}%
              </span>
              {trendLabel && <span className="text-[11px] text-[#a3a3a3]">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${c.bg} ring-1 ring-transparent ${c.ring} transition-all`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}

const mockChartData = [
  { name: 'Lun', revenue: 2400 },
  { name: 'Mar', revenue: 1398 },
  { name: 'Mer', revenue: 3200 },
  { name: 'Jeu', revenue: 2780 },
  { name: 'Ven', revenue: 4890 },
  { name: 'Sam', revenue: 5390 },
  { name: 'Dim', revenue: 3490 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] text-white px-3 py-2 rounded-lg text-[12px] shadow-lg">
      <p className="font-medium">{label}</p>
      <p className="text-[#a3a3a3]">
        {payload[0].value.toLocaleString('fr-FR')} EGP
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '3m'>('7d');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/analytics/dashboard-stats?period=today'),
          api.get('/orders?date=today').catch(() => ({ data: { orders: [] } })),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (ordersRes.data.orders) setRecentOrders(ordersRes.data.orders.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const getStatusConfig = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
      CONFIRMED: { label: 'Confirmee', color: 'bg-blue-100 text-blue-700' },
      PREPARING: { label: 'En preparation', color: 'bg-indigo-100 text-indigo-700' },
      READY: { label: 'Prete', color: 'bg-emerald-100 text-emerald-700' },
      OUT_FOR_DELIVERY: { label: 'En livraison', color: 'bg-purple-100 text-purple-700' },
      DELIVERED: { label: 'Livree', color: 'bg-gray-100 text-gray-600' },
      CANCELLED: { label: 'Annulee', color: 'bg-red-100 text-red-600' },
    };
    return config[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return 'A l\'instant';
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#0a0a0a] tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-[13px] text-[#a3a3a3] mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Revenus du jour"
          value={stats?.revenue.value ? `${formatCurrency(stats.revenue.value)} EGP` : '0 EGP'}
          numericValue={stats?.revenue.value || 0}
          suffix=" EGP"
          trend={stats?.revenue.change}
          trendLabel="vs hier"
          icon={DollarSign}
          color="green"
          loading={loading}
          delay={0}
        />
        <KPICard
          title="Commandes"
          value={stats?.orders.value?.toString() || '0'}
          numericValue={stats?.orders.value || 0}
          trend={stats?.orders.change}
          trendLabel="vs hier"
          icon={ShoppingBag}
          color="blue"
          loading={loading}
          delay={0.05}
        />
        <KPICard
          title="Nouveaux clients"
          value={stats?.newCustomers.value?.toString() || '0'}
          numericValue={stats?.newCustomers.value || 0}
          icon={Users}
          color="purple"
          loading={loading}
          delay={0.1}
        />
        <KPICard
          title="Panier moyen"
          value={stats?.averageOrderValue.value ? `${formatCurrency(stats.averageOrderValue.value)} EGP` : '0 EGP'}
          numericValue={stats?.averageOrderValue.value || 0}
          suffix=" EGP"
          icon={Star}
          color="orange"
          loading={loading}
          delay={0.15}
        />
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-xl border border-[#e5e5e5] p-5"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[15px] font-semibold text-[#0a0a0a]">Chiffre d&apos;affaires</h2>
            <p className="text-[12px] text-[#a3a3a3] mt-0.5">Evolution sur la periode</p>
          </div>
          <div className="flex items-center gap-1 bg-[#f5f5f5] rounded-lg p-0.5">
            {(['7d', '30d', '3m'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                  chartPeriod === period
                    ? 'bg-white text-[#0a0a0a] shadow-sm'
                    : 'text-[#a3a3a3] hover:text-[#737373]'
                }`}
              >
                {period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : '3 mois'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#a3a3a3' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#a3a3a3' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e5e5', strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two columns: Recent orders + Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-3 bg-white rounded-xl border border-[#e5e5e5]"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5]">
            <h2 className="text-[15px] font-semibold text-[#0a0a0a]">Commandes recentes</h2>
            <button
              onClick={() => router.push('/dashboard/orders')}
              className="flex items-center gap-1 text-[12px] font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors"
            >
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#f5f5f5]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#f5f5f5] rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-[#f5f5f5] rounded animate-pulse" />
                    <div className="h-2.5 w-24 bg-[#f5f5f5] rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-16 bg-[#f5f5f5] rounded animate-pulse" />
                </div>
              ))
            ) : recentOrders.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Package className="w-8 h-8 text-[#d4d4d4] mx-auto mb-2" />
                <p className="text-[13px] text-[#a3a3a3]">Aucune commande aujourd&apos;hui</p>
              </div>
            ) : (
              recentOrders.map((order, idx) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#fafafa] transition-colors cursor-pointer"
                    onClick={() => router.push('/dashboard/orders')}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#f5f5f5]">
                      <Package className="w-4 h-4 text-[#737373]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-[#0a0a0a]">
                          {order.orderNumber}
                        </p>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#a3a3a3] truncate">
                        {order.customer?.name || 'Client'} · {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-semibold text-[#0a0a0a]">
                        {order.total?.toFixed(2)} EGP
                      </p>
                      <p className="text-[11px] text-[#a3a3a3]">
                        {formatTime(order.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Avg processing time */}
          <div className="bg-white rounded-xl border border-[#e5e5e5] p-5">
            <h3 className="text-[13px] font-medium text-[#737373] mb-4">Temps moyen</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[13px] text-[#0a0a0a]">Preparation</span>
                </div>
                <span className="text-[14px] font-semibold text-[#0a0a0a]">
                  {stats?.avgProcessingTime ? `${Math.round(typeof stats.avgProcessingTime === 'number' ? stats.avgProcessingTime : stats.avgProcessingTime.value)} min` : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-[13px] text-[#0a0a0a]">Livraison</span>
                </div>
                <span className="text-[14px] font-semibold text-[#0a0a0a]">--</span>
              </div>
            </div>
          </div>

          {/* Conversion rate */}
          <div className="bg-white rounded-xl border border-[#e5e5e5] p-5">
            <h3 className="text-[13px] font-medium text-[#737373] mb-3">Taux de conversion</h3>
            <div className="flex items-end gap-2">
              <span className="text-[28px] font-semibold text-[#0a0a0a] leading-none">
                {stats?.conversionRate?.value ? `${stats.conversionRate.value.toFixed(0)}` : '0'}%
              </span>
            </div>
            <div className="mt-3 w-full h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(stats?.conversionRate?.value || 0, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-[#3b82f6] to-[#a855f7] rounded-full"
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-[#e5e5e5] p-5">
            <h3 className="text-[13px] font-medium text-[#737373] mb-3">Acces rapides</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Commandes', href: '/dashboard/orders', icon: Package },
                { label: 'Menu', href: '/dashboard/menu', icon: ShoppingBag },
                { label: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
                { label: 'Parametres', href: '/dashboard/settings', icon: Star },
              ].map((action) => (
                <button
                  key={action.href}
                  onClick={() => router.push(action.href)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#e5e5e5] text-[12px] font-medium text-[#737373] hover:text-[#0a0a0a] hover:border-[#d4d4d4] hover:bg-[#fafafa] transition-all"
                >
                  <action.icon className="w-3.5 h-3.5" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, DollarSign, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}

function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && (
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

export default function DashboardPage() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: 'Commandes du jour',
      value: '12',
      icon: ShoppingBag,
      trend: '+2 depuis hier',
    },
    {
      title: 'Revenus du jour',
      value: '450 EGP',
      icon: DollarSign,
      trend: '+15% vs hier',
    },
    {
      title: 'Clients actifs',
      value: '8',
      icon: Users,
      trend: '3 nouveaux aujourd\'hui',
    },
    {
      title: 'Messages non lus',
      value: '3',
      icon: MessageSquare,
      trend: '2 dans les dernières heures',
    },
  ];

  return (
    <div className="h-full">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Tableau de bord
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>
    </div>
  );
}

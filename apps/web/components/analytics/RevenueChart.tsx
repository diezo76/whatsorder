'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: RevenueChartData[];
  loading?: boolean;
}

export default function RevenueChart({ data, loading }: RevenueChartProps) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  // Formater les données pour le graphe
  const chartData = data.map(item => ({
    ...item,
    dateFormatted: format(new Date(item.date), 'dd MMM', { locale: fr })
  }));

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <p className="text-sm font-semibold text-gray-900 mb-2">
          {format(new Date(payload[0].payload.date), 'dd MMMM yyyy', { locale: fr })}
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span className="text-sm text-gray-600">Revenus:</span>
            <span className="text-sm font-bold text-orange-600">
              {payload[0].value.toFixed(2)} EGP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-sm text-gray-600">Commandes:</span>
            <span className="text-sm font-bold text-blue-600">
              {payload[1].value}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="dateFormatted"
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
          label={{ value: 'Revenus (EGP)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
          label={{ value: 'Commandes', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 14, paddingTop: 20 }}
          iconType="circle"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          stroke="#ea580c"
          strokeWidth={3}
          dot={{ fill: '#ea580c', r: 4 }}
          activeDot={{ r: 6 }}
          name="Revenus (EGP)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="orders"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: '#2563eb', r: 3 }}
          name="Commandes"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

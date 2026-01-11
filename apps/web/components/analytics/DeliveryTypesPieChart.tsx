'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DeliveryTypeData {
  type: string;
  count: number;
  revenue: number;
}

interface DeliveryTypesPieChartProps {
  data: DeliveryTypeData[];
  loading?: boolean;
}

const COLORS = {
  DELIVERY: '#ea580c',    // Orange
  PICKUP: '#2563eb',      // Blue
  DINE_IN: '#16a34a'      // Green
};

const LABELS = {
  DELIVERY: '🚚 Livraison',
  PICKUP: '🏃 À emporter',
  DINE_IN: '🍽️ Sur place'
};

export default function DeliveryTypesPieChart({ data, loading }: DeliveryTypesPieChartProps) {
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

  // Formater les données
  const chartData = data.map(item => ({
    name: LABELS[item.type as keyof typeof LABELS] || item.type,
    value: item.count,
    revenue: item.revenue,
    type: item.type
  }));

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const percentage = ((data.value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1);

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <p className="text-sm font-semibold text-gray-900 mb-2">
          {data.name}
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Commandes:</span>
            <span className="text-sm font-bold text-orange-600">
              {data.value} ({percentage}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Revenus:</span>
            <span className="text-sm font-bold text-green-600">
              {data.revenue.toFixed(2)} EGP
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Label personnalisé
  const renderLabel = (entry: any) => {
    const percentage = ((entry.value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(0);
    return `${percentage}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.type as keyof typeof COLORS] || '#9ca3af'}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

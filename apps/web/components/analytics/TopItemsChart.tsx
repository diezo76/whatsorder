'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface TopItem {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  revenue: number;
}

interface TopItemsChartProps {
  items: TopItem[];
  loading?: boolean;
}

const COLORS = [
  '#ea580c', // Orange
  '#2563eb', // Blue
  '#16a34a', // Green
  '#9333ea', // Purple
  '#eab308', // Yellow
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#14b8a6'  // Teal
];

export default function TopItemsChart({ items, loading }: TopItemsChartProps) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        Aucun article vendu
      </div>
    );
  }

  // Prendre les 10 premiers
  const chartData = items.slice(0, 10).map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    fullName: item.name,
    quantity: item.quantity,
    revenue: item.revenue
  }));

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <p className="text-sm font-semibold text-gray-900 mb-2">
          {payload[0].payload.fullName}
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Quantité vendue:</span>
            <span className="text-sm font-bold text-orange-600">
              {payload[0].value}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Revenus:</span>
            <span className="text-sm font-bold text-green-600">
              {payload[0].payload.revenue.toFixed(2)} EGP
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          tick={{ fontSize: 11 }}
          height={80}
          stroke="#9ca3af"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
          label={{ value: 'Quantité Vendue', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="quantity"
          radius={[8, 8, 0, 0]}
          name="Quantité"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

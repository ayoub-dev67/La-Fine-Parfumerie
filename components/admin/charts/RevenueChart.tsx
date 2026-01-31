'use client';

/**
 * GRAPHIQUE DES REVENUS
 * Affiche l'évolution du CA avec Recharts
 * Design noir/or luxe
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: ChartData[];
  type?: 'area' | 'bar';
}

export default function RevenueChart({ data, type = 'area' }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k€`;
    }
    return `${value.toFixed(0)}€`;
  };

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black border border-[#c5a059]/50 rounded-lg p-3 shadow-lg">
          <p className="text-[#c5a059] font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-white text-sm">
              {entry.dataKey === 'revenue' ? 'CA: ' : 'Commandes: '}
              <span className="text-[#c5a059]">
                {entry.dataKey === 'revenue'
                  ? `${entry.value.toFixed(2)}€`
                  : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis
            dataKey="date"
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
            axisLine={{ stroke: '#333' }}
          />
          <YAxis
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
            tickFormatter={formatCurrency}
            axisLine={{ stroke: '#333' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="revenue"
            fill="#c5a059"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#c5a059" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis
          dataKey="date"
          stroke="#666"
          tick={{ fill: '#666', fontSize: 12 }}
          axisLine={{ stroke: '#333' }}
        />
        <YAxis
          stroke="#666"
          tick={{ fill: '#666', fontSize: 12 }}
          tickFormatter={formatCurrency}
          axisLine={{ stroke: '#333' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#c5a059"
          strokeWidth={2}
          fill="url(#colorRevenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

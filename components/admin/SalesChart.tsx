'use client';

/**
 * SalesChart - Graphique des ventes par période
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface SalesChartProps {
  data: SalesData[];
  period: 'day' | 'week' | 'month';
}

export function SalesChart({ data, period }: SalesChartProps) {
  const periodLabel = {
    day: 'jour',
    week: 'semaine',
    month: 'mois',
  }[period];

  return (
    <div className="bg-noir/50 rounded-xl p-6 border border-or/20">
      <h3 className="text-lg font-semibold text-or mb-4">
        Chiffre d&apos;affaires par {periodLabel}
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              stroke="#999"
              tick={{ fill: '#999', fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              stroke="#c5a059"
              tick={{ fill: '#c5a059', fontSize: 12 }}
              tickFormatter={(value) => `${value}€`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#22c55e"
              tick={{ fill: '#22c55e', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #c5a059',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value, name) => [
                name === 'revenue' ? `${value ?? 0}€` : (value ?? 0),
                name === 'revenue' ? 'CA' : 'Commandes',
              ]}
            />
            <Legend
              formatter={(value) => (value === 'revenue' ? 'Chiffre d\'affaires' : 'Commandes')}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#c5a059"
              strokeWidth={2}
              dot={{ fill: '#c5a059', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#c5a059' }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: '#22c55e', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

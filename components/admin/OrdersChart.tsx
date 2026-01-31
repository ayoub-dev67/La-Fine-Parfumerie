'use client';

/**
 * OrdersChart - Graphique des commandes par statut
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface StatusData {
  status: string;
  count: number;
  fill: string;
}

interface OrdersChartProps {
  data: StatusData[];
}

export function OrdersChart({ data }: OrdersChartProps) {
  return (
    <div className="bg-noir/50 rounded-xl p-6 border border-or/20">
      <h3 className="text-lg font-semibold text-or mb-4">
        Commandes par statut
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
            <XAxis type="number" stroke="#999" tick={{ fill: '#999', fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="status"
              stroke="#999"
              tick={{ fill: '#ccc', fontSize: 12 }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #c5a059',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value) => [value ?? 0, 'Commandes']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

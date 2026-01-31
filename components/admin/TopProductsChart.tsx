'use client';

/**
 * TopProductsChart - Top 10 produits par revenu
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ProductData {
  name: string;
  brand: string;
  quantity: number;
  revenue: number;
}

interface TopProductsChartProps {
  data: ProductData[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  // Tronquer les noms longs
  const formattedData = data.map((p) => ({
    ...p,
    displayName: p.name.length > 20 ? p.name.slice(0, 20) + '...' : p.name,
  }));

  return (
    <div className="bg-noir/50 rounded-xl p-6 border border-or/20">
      <h3 className="text-lg font-semibold text-or mb-4">
        Top 10 produits par revenu
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
            <XAxis
              type="number"
              stroke="#999"
              tick={{ fill: '#999', fontSize: 12 }}
              tickFormatter={(value) => `${value}€`}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              stroke="#999"
              tick={{ fill: '#ccc', fontSize: 11 }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #c5a059',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value, name) => {
                if (name === 'revenue') {
                  return [`${value ?? 0}€`, 'Revenu'];
                }
                return [value ?? 0, name ?? ''];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const item = payload[0].payload as ProductData;
                  return `${item.name} ${item.brand ? `(${item.brand})` : ''}`;
                }
                return label;
              }}
            />
            <Bar
              dataKey="revenue"
              fill="#c5a059"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

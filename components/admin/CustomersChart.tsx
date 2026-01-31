'use client';

/**
 * CustomersChart - Répartition clients nouveaux vs récurrents
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CustomerData {
  name: string;
  value: number;
  fill: string;
}

interface CustomersChartProps {
  data: CustomerData[];
}

export function CustomersChart({ data }: CustomersChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
  }) => {
    const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-noir/50 rounded-xl p-6 border border-or/20">
      <h3 className="text-lg font-semibold text-or mb-4">
        Répartition clients
      </h3>
      <div className="h-80 flex items-center justify-center">
        {total === 0 ? (
          <p className="text-creme/50">Aucune donnée disponible</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                innerRadius={50}
                dataKey="value"
                strokeWidth={2}
                stroke="#1a1a1a"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #c5a059',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value, name) => [value ?? 0, name ?? '']}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: '#ccc' }}>
                    {value} ({data.find((d) => d.name === value)?.value || 0})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

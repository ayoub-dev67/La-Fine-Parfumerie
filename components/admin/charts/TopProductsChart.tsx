'use client';

/**
 * GRAPHIQUE TOP PRODUITS
 * Barres horizontales des produits les plus vendus
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Image from 'next/image';

interface TopProduct {
  id: number;
  name: string;
  brand: string | null;
  image: string;
  totalSold: number;
  revenue: number;
}

interface TopProductsChartProps {
  products: TopProduct[];
}

export default function TopProductsChart({ products }: TopProductsChartProps) {
  const data = products.slice(0, 5).map((p) => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    fullName: p.name,
    brand: p.brand,
    sold: p.totalSold,
    revenue: p.revenue,
  }));

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: { fullName: string; brand: string; sold: number; revenue: number } }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-black border border-[#c5a059]/50 rounded-lg p-3 shadow-lg max-w-[200px]">
          <p className="text-white font-semibold text-sm">{item.fullName}</p>
          {item.brand && <p className="text-[#c5a059] text-xs">{item.brand}</p>}
          <div className="mt-2 space-y-1">
            <p className="text-gray-400 text-sm">
              Vendus: <span className="text-white">{item.sold}</span>
            </p>
            <p className="text-gray-400 text-sm">
              CA: <span className="text-[#c5a059]">{item.revenue.toFixed(2)}€</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-gray-500">
        Aucune vente enregistrée
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis
          type="number"
          stroke="#666"
          tick={{ fill: '#666', fontSize: 12 }}
          axisLine={{ stroke: '#333' }}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#666"
          tick={{ fill: '#999', fontSize: 11 }}
          width={120}
          axisLine={{ stroke: '#333' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="sold" radius={[0, 4, 4, 0]} maxBarSize={25}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? '#c5a059' : `rgba(197, 160, 89, ${0.7 - index * 0.1})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Composant liste alternative pour les produits
export function TopProductsList({ products }: TopProductsChartProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-gray-500">
        Aucune vente enregistrée
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.slice(0, 5).map((product, index) => (
        <div
          key={product.id}
          className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-gray-800"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#c5a059]/20 text-[#c5a059] text-sm font-bold">
            {index + 1}
          </div>
          <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{product.name}</p>
            {product.brand && (
              <p className="text-[#c5a059] text-xs">{product.brand}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-white font-semibold">{product.totalSold}</p>
            <p className="text-gray-500 text-xs">vendus</p>
          </div>
        </div>
      ))}
    </div>
  );
}

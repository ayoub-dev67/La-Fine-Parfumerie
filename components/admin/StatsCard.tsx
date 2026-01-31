/**
 * STATS CARD
 * Carte de statistique pour le dashboard admin
 * Design noir/or avec alerte optionnelle
 */

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  alert?: boolean;
}

export default function StatsCard({ title, value, icon, trend, alert }: StatsCardProps) {
  return (
    <div
      className={`bg-black border rounded-lg p-6 transition-all hover:shadow-lg hover:shadow-[#c5a059]/10 ${
        alert ? 'border-red-500/50 hover:border-red-500' : 'border-[#c5a059]/20 hover:border-[#c5a059]/40'
      }`}
    >
      {/* Header avec icône et alerte */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        {alert && (
          <span className="px-2 py-1 text-xs font-semibold text-red-400 bg-red-500/20 rounded">
            ⚠️ Alerte
          </span>
        )}
      </div>

      {/* Titre */}
      <h3 className="text-gray-400 text-sm mb-2 font-medium">{title}</h3>

      {/* Valeur principale */}
      <p className={`text-3xl font-bold mb-2 ${alert ? 'text-red-400' : 'text-white'}`}>
        {value}
      </p>

      {/* Tendance */}
      {trend && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          {trend.startsWith('+') && <span className="text-green-500">↗</span>}
          {trend.startsWith('-') && <span className="text-red-500">↘</span>}
          {trend}
        </p>
      )}
    </div>
  );
}

/**
 * DÉTAIL COMMANDE ADMIN
 * Vue détaillée d'une commande avec possibilité d'expédition
 */

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ShipOrderForm from '@/components/admin/ShipOrderForm';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true, brand: true, image: true } },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const canShip = order.status === 'PAID' && !order.shippedAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-[#c5a059] hover:underline text-sm mb-2 inline-block"
          >
            ← Retour aux commandes
          </Link>
          <h1 className="text-3xl font-bold text-[#c5a059] font-serif">
            Commande #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-gray-400 mt-1">
            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            order.status === 'SHIPPED'
              ? 'bg-green-500/20 text-green-400'
              : order.status === 'PAID'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          {order.status === 'SHIPPED'
            ? '📦 Expédiée'
            : order.status === 'PAID'
            ? '✅ Payée'
            : '⏳ En attente'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Articles */}
          <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#c5a059] mb-4">
              Articles commandés
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-lg border border-gray-800"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg border border-[#c5a059]/20"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-400">{item.product.brand}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Quantité: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#c5a059] font-semibold">
                      {Number(item.price).toFixed(2)}€
                    </p>
                    <p className="text-xs text-gray-400">
                      × {item.quantity} ={' '}
                      {(Number(item.price) * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold text-white">Total</p>
                <p className="text-2xl font-bold text-[#c5a059]">
                  {Number(order.totalAmount).toFixed(2)}€
                </p>
              </div>
            </div>
          </div>

          {/* Informations d'expédition */}
          {order.shippedAt && (
            <div className="bg-black border border-green-500/20 rounded-lg p-6">
              <h2 className="text-xl font-bold text-green-400 mb-4">
                📦 Informations d'expédition
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Transporteur</p>
                  <p className="text-white font-semibold">{order.carrier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Numéro de suivi</p>
                  <p className="text-white font-mono">{order.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date d'expédition</p>
                  <p className="text-white">
                    {new Date(order.shippedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Informations client */}
          <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#c5a059] mb-4">Client</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Nom</p>
                <p className="text-white font-semibold">
                  {order.user?.name || 'Non renseigné'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{order.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Informations commande */}
          <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#c5a059] mb-4">
              Informations
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Session Stripe</p>
                <p className="text-white font-mono text-xs break-all">
                  {order.stripeSessionId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Montant total</p>
                <p className="text-white font-semibold text-lg">
                  {Number(order.totalAmount).toFixed(2)}€
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire d'expédition */}
          {canShip && <ShipOrderForm orderId={order.id} />}
        </div>
      </div>
    </div>
  );
}

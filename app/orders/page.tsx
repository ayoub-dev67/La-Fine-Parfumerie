import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const orders = await prisma.order.findMany({
    where: {
      user: {
        email: session.user.email,
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#c5a059] mb-8">Mes commandes</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-8">
              Vous n&apos;avez pas encore de commande
            </p>
            <Link
              href="/products"
              className="px-8 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors inline-block"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-black border border-[#c5a059]/20 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Commande #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#c5a059]">
                      {Number(order.totalAmount).toFixed(2)}€
                    </p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
                        order.status === "SHIPPED"
                          ? "bg-green-500/20 text-green-400"
                          : order.status === "PAID"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {order.status === "SHIPPED"
                        ? "Expédié"
                        : order.status === "PAID"
                          ? "Payé"
                          : "En attente"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">
                    Articles commandés
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {item.product.name} x{item.quantity}
                        </span>
                        <span className="text-[#c5a059]">
                          {(Number(item.price) * item.quantity).toFixed(2)}€
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-[#c5a059]/10 rounded border border-[#c5a059]/30">
                    <p className="text-sm text-gray-300">
                      <strong className="text-[#c5a059]">Suivi : </strong>
                      {order.trackingNumber} ({order.carrier})
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

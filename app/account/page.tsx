import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AccountPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      orders: {
        where: { status: "PAID" },
      },
    },
  });

  const totalOrders = user?.orders.length || 0;
  const totalSpent =
    user?.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0) || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#c5a059] mb-8">Mon compte</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
            <h3 className="text-sm text-gray-400 mb-2">Total des commandes</h3>
            <p className="text-3xl font-bold text-white">{totalOrders}</p>
          </div>
          <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
            <h3 className="text-sm text-gray-400 mb-2">Total dépensé</h3>
            <p className="text-3xl font-bold text-[#c5a059]">
              {totalSpent.toFixed(2)}€
            </p>
          </div>
        </div>

        <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Informations personnelles
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom</label>
              <p className="text-white text-lg">
                {session.user.name || "Non renseigné"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <p className="text-white text-lg">{session.user.email}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Rôle</label>
              <span
                className={`inline-block px-3 py-1 rounded text-sm ${
                  session.user.role === "ADMIN"
                    ? "bg-[#c5a059] text-black"
                    : "bg-gray-700 text-white"
                }`}
              >
                {session.user.role === "ADMIN" ? "Administrateur" : "Client"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/orders"
            className="px-6 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors"
          >
            Voir mes commandes
          </Link>
          {session.user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Dashboard Admin
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

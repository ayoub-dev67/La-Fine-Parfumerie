"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import Link from "next/link";
import { Order } from "@/types";

/**
 * Composant interne qui utilise useSearchParams
 * DOIT être wrappé dans Suspense pour éviter les problèmes d'hydratation
 */
function SuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Vider le panier et récupérer les infos de commande - UNE SEULE FOIS
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    // Vérifier si cette session a déjà été traitée (évite double clear)
    const clearedSessionId = sessionStorage.getItem("cleared_session_id");
    if (clearedSessionId !== sessionId) {
      // Vider le panier et marquer la session comme traitée
      clearCart();
      sessionStorage.setItem("cleared_session_id", sessionId);
    }

    // Récupérer les infos de commande
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la commande:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]); // clearCart omis volontairement pour éviter la boucle infinie

  if (loading) {
    return (
      <div className="text-center mb-6">
        <div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-creme/60">Chargement des informations...</p>
      </div>
    );
  }

  return (
    <>
      {/* Informations de commande */}
      {order && (
        <div className="bg-noir-50 border border-or/20 rounded-lg p-6 mb-8 text-left">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-creme">
              Détails de votre commande
            </h3>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                order.status === "paid"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : order.status === "pending"
                  ? "bg-or/20 text-or border border-or/30"
                  : "bg-creme/10 text-creme/60 border border-creme/20"
              }`}
            >
              {order.status === "paid"
                ? "Payé"
                : order.status === "pending"
                ? "En attente"
                : order.status}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-creme/60">Numéro de commande</span>
              <span className="text-creme font-mono text-xs">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-creme/60">Montant total</span>
              <span className="text-or font-serif">{order.totalAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-creme/60">Date</span>
              <span className="text-creme">{new Date(order.createdAt).toLocaleString("fr-FR")}</span>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <span className="text-creme/60">Payé le</span>
                <span className="text-creme">{new Date(order.paidAt).toLocaleString("fr-FR")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message si commande non trouvée */}
      {!order && sessionId && (
        <p className="text-sm text-creme/40 mb-6 font-mono">
          Session : {sessionId.slice(0, 20)}...
        </p>
      )}
    </>
  );
}

/**
 * Page de confirmation après paiement réussi
 * Architecture avec Suspense pour éviter les problèmes d'hydratation
 */
export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-noir flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        {/* Card principale */}
        <div className="bg-noir-50 border border-or/20 rounded-lg p-8 text-center">
          {/* Icône de succès */}
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 border-2 border-green-500/50 rounded-full flex items-center justify-center bg-green-500/10">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Ligne décorative */}
          <div className="w-16 h-px bg-or mx-auto mb-6" />

          {/* Message de confirmation */}
          <h1 className="font-serif text-3xl md:text-4xl text-or mb-4">
            Paiement réussi !
          </h1>
          <p className="text-creme/60 mb-8">
            Merci pour votre commande. Votre paiement a été traité avec succès.
          </p>

          {/* Contenu dynamique avec Suspense */}
          <Suspense
            fallback={
              <div className="text-center mb-6">
                <div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-creme/60">Chargement...</p>
              </div>
            }
          >
            <SuccessContent />
          </Suspense>

          {/* Prochaines étapes */}
          <div className="bg-noir border border-or/10 rounded-lg p-5 mb-8 text-left">
            <h3 className="font-serif text-creme mb-3">
              Prochaines étapes
            </h3>
            <ul className="text-sm text-creme/60 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Votre commande a été enregistrée
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Vous recevrez un email de confirmation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Votre commande sera expédiée sous 24-48h
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Livraison gratuite pour cette commande
              </li>
            </ul>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              className="flex-1 btn-luxury text-center"
            >
              Continuer mes achats
            </Link>
            <Link
              href="/orders"
              className="flex-1 btn-luxury-outline text-center"
            >
              Voir mes commandes
            </Link>
          </div>
        </div>

        {/* Lien retour accueil */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-creme/40 hover:text-or transition-colors text-sm"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

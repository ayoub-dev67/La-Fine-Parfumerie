'use client';

/**
 * Empty State Components
 * Beautiful empty states for various scenarios
 */

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 px-4 ${className}`}
    >
      {icon && (
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-or/20 to-or/5 flex items-center justify-center">
          {icon}
        </div>
      )}

      <h3 className="text-xl font-serif text-creme mb-2">{title}</h3>

      {description && (
        <p className="text-creme/60 mb-6 max-w-sm mx-auto">{description}</p>
      )}

      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 px-6 py-3 bg-or text-noir font-semibold rounded-lg hover:bg-or/90 transition-colors"
          >
            {action.label}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-or text-noir font-semibold rounded-lg hover:bg-or/90 transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </motion.div>
  );
}

// Pre-built empty states for common scenarios

export function EmptyCart() {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-or/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      }
      title="Votre panier est vide"
      description="Découvrez notre collection de parfums d'exception et ajoutez vos favoris au panier."
      action={{ label: 'Parcourir la boutique', href: '/boutique' }}
    />
  );
}

export function EmptyWishlist() {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-or/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      }
      title="Votre wishlist est vide"
      description="Ajoutez des parfums à votre liste de souhaits pour les retrouver facilement."
      action={{ label: 'Découvrir nos parfums', href: '/boutique' }}
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-or/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      }
      title="Aucune commande"
      description="Vous n'avez pas encore passé de commande. Découvrez notre collection exclusive."
      action={{ label: 'Commencer vos achats', href: '/boutique' }}
    />
  );
}

export function EmptySearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-or/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      title="Aucun résultat"
      description={query ? `Aucun produit ne correspond à "${query}". Essayez avec d'autres termes.` : "Aucun produit trouvé avec ces critères."}
      action={{ label: 'Voir tous les produits', href: '/boutique' }}
    />
  );
}

export function EmptyReviews() {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-or/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      }
      title="Aucun avis"
      description="Soyez le premier à donner votre avis sur ce produit !"
    />
  );
}

export function EmptyCompare() {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-or/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
      title="Aucun produit à comparer"
      description="Ajoutez des produits à votre liste de comparaison pour les voir côte à côte."
      action={{ label: 'Parcourir la boutique', href: '/boutique' }}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-or/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      }
      title="Aucune notification"
      description="Vous êtes à jour ! Revenez plus tard pour voir les nouvelles notifications."
    />
  );
}

export function EmptyConversation() {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-or/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      }
      title="Démarrez une conversation"
      description="Posez une question et notre assistant vous répondra instantanément."
    />
  );
}

export function ErrorState({
  title = "Une erreur est survenue",
  description = "Nous n'avons pas pu charger les données. Veuillez réessayer.",
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      }
      title={title}
      description={description}
      action={onRetry ? { label: 'Réessayer', onClick: onRetry } : undefined}
    />
  );
}

export function NoAccessState() {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-or/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      }
      title="Accès restreint"
      description="Vous devez être connecté pour accéder à cette page."
      action={{ label: 'Se connecter', href: '/auth/login' }}
    />
  );
}

export function MaintenanceState() {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-or/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      }
      title="Maintenance en cours"
      description="Nous effectuons actuellement des améliorations. Revenez dans quelques instants."
    />
  );
}

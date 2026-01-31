"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ReviewStars from "./ReviewStars";
import type { Review } from "@/types";

interface ReviewListProps {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onReviewDeleted: () => void;
}

/**
 * Liste des avis avec pagination
 */
export default function ReviewList({
  reviews,
  pagination,
  onPageChange,
  onReviewDeleted,
}: ReviewListProps) {
  const { data: session } = useSession();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      return;
    }

    setDeletingId(reviewId);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onReviewDeleted();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 border border-or/20 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-or/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="text-creme/50 font-serif text-lg">
          Aucun avis pour le moment
        </p>
        <p className="text-creme/30 text-sm mt-2">
          Soyez le premier à partager votre expérience !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Liste des avis */}
      <AnimatePresence mode="wait">
        {reviews.map((review, index) => {
          const isAuthor = session?.user?.id === review.userId;
          const isAdmin = session?.user?.role === "ADMIN";
          const canDelete = isAuthor || isAdmin;

          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-noir-50 border border-or/10 rounded-lg p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-noir-100 border border-or/20">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name || "Avatar"}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-or font-serif">
                        {(review.user.name || "A")[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info utilisateur */}
                  <div>
                    <p className="text-creme font-medium">
                      {review.user.name || "Anonyme"}
                      {isAuthor && (
                        <span className="ml-2 text-xs text-or">(vous)</span>
                      )}
                    </p>
                    <p className="text-creme/40 text-xs">
                      {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="text-creme/30 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Supprimer l'avis"
                  >
                    {deletingId === review.id ? (
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {/* Rating */}
              <ReviewStars rating={review.rating} size="sm" />

              {/* Contenu */}
              {review.title && (
                <h4 className="text-creme font-medium mt-3">{review.title}</h4>
              )}
              <p className="text-creme/70 mt-2 leading-relaxed">
                {review.comment}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="w-10 h-10 border border-or/30 flex items-center justify-center text-creme hover:text-or hover:border-or disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Numéros de page */}
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((page) => {
              // Afficher : première, dernière, courante, et ±1
              return (
                page === 1 ||
                page === pagination.totalPages ||
                Math.abs(page - pagination.page) <= 1
              );
            })
            .map((page, index, arr) => {
              // Ajouter des ellipses si nécessaire
              const showEllipsisBefore = index > 0 && page - arr[index - 1] > 1;

              return (
                <span key={page} className="flex items-center">
                  {showEllipsisBefore && (
                    <span className="text-creme/30 px-2">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 border flex items-center justify-center transition-colors ${
                      page === pagination.page
                        ? "border-or bg-or text-noir"
                        : "border-or/30 text-creme hover:text-or hover:border-or"
                    }`}
                  >
                    {page}
                  </button>
                </span>
              );
            })}

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="w-10 h-10 border border-or/30 flex items-center justify-center text-creme hover:text-or hover:border-or disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Info pagination */}
      <p className="text-center text-creme/40 text-sm">
        Affichage {(pagination.page - 1) * pagination.limit + 1} -{" "}
        {Math.min(pagination.page * pagination.limit, pagination.total)} sur{" "}
        {pagination.total} avis
      </p>
    </div>
  );
}

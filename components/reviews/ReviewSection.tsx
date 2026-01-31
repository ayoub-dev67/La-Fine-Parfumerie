"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ReviewStats from "./ReviewStats";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import type { ReviewsResponse } from "@/types";

interface ReviewSectionProps {
  productId: number;
}

/**
 * Section complète des avis pour la page produit
 * Combine stats, formulaire et liste avec pagination
 */
export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/products/${productId}/reviews?page=${page}&limit=5`
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des avis");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll vers le haut de la section avis
    document.getElementById("reviews-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleReviewSubmitted = () => {
    // Recharger les avis après soumission
    setPage(1);
    fetchReviews();
  };

  if (loading && !data) {
    return (
      <section id="reviews-section" className="py-16 border-t border-or/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-noir-50 rounded w-48" />
            <div className="h-40 bg-noir-50 rounded" />
            <div className="h-60 bg-noir-50 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="reviews-section" className="py-16 border-t border-or/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchReviews}
              className="mt-4 btn-luxury-outline text-sm"
            >
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews-section" className="py-16 border-t border-or/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-or text-xs font-sans tracking-[0.3em] uppercase">
            Témoignages
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-creme mt-4 mb-4">
            Avis Clients
          </h2>
          <div className="w-16 h-px bg-or mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche : Stats + Formulaire */}
          <div className="lg:col-span-1 space-y-8">
            {/* Statistiques */}
            {data && <ReviewStats stats={data.stats} />}

            {/* Formulaire */}
            <ReviewForm
              productId={productId}
              existingReview={data?.userReview}
              onReviewSubmitted={handleReviewSubmitted}
            />
          </div>

          {/* Colonne droite : Liste des avis */}
          <div className="lg:col-span-2">
            {data && (
              <ReviewList
                reviews={data.reviews}
                pagination={data.pagination}
                onPageChange={handlePageChange}
                onReviewDeleted={handleReviewSubmitted}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

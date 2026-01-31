"use client";

import { motion } from "framer-motion";
import ReviewStars from "./ReviewStars";
import type { ReviewStats as ReviewStatsType } from "@/types";

interface ReviewStatsProps {
  stats: ReviewStatsType;
}

/**
 * Affiche les statistiques des avis
 * Note moyenne, distribution des notes
 */
export default function ReviewStats({ stats }: ReviewStatsProps) {
  const { averageRating, totalReviews, distribution } = stats;

  // Calculer le pourcentage max pour la barre de progression
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="bg-noir-50 border border-or/20 rounded-lg p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Note moyenne */}
        <div className="text-center md:text-left md:pr-8 md:border-r md:border-or/10">
          <div className="font-serif text-5xl text-or mb-2">
            {averageRating > 0 ? averageRating.toFixed(1) : "-"}
          </div>
          <ReviewStars rating={Math.round(averageRating)} size="md" />
          <p className="text-creme/50 text-sm mt-2">
            {totalReviews} avis
          </p>
        </div>

        {/* Distribution des notes */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star as keyof typeof distribution];
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-creme/60 text-sm w-4">{star}</span>
                <svg
                  className="w-4 h-4 text-or"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <div className="flex-1 h-2 bg-noir rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, delay: (5 - star) * 0.1 }}
                    className="h-full bg-or rounded-full"
                  />
                </div>
                <span className="text-creme/40 text-xs w-12 text-right">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

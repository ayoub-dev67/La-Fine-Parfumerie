"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ReviewStars from "./ReviewStars";
import type { Review } from "@/types";

interface ReviewFormProps {
  productId: number;
  existingReview?: Review | null;
  onReviewSubmitted: () => void;
}

/**
 * Formulaire de soumission d'avis
 * Gère la création et la modification d'avis
 */
export default function ReviewForm({
  productId,
  existingReview,
  onReviewSubmitted,
}: ReviewFormProps) {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Si l'utilisateur a déjà un avis et n'est pas en mode édition
  if (existingReview && !isEditing) {
    return (
      <div className="bg-noir-50 border border-or/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-creme">Votre avis</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-or text-sm hover:underline"
          >
            Modifier
          </button>
        </div>
        <ReviewStars rating={existingReview.rating} />
        {existingReview.title && (
          <p className="text-creme font-medium mt-3">{existingReview.title}</p>
        )}
        <p className="text-creme/70 mt-2">{existingReview.comment}</p>
        <p className="text-creme/40 text-xs mt-4">
          Publié le {new Date(existingReview.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </div>
    );
  }

  // Si non connecté
  if (status === "unauthenticated") {
    return (
      <div className="bg-noir-50 border border-or/20 rounded-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 border border-or/30 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-or/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h3 className="font-serif text-lg text-creme mb-2">
          Connectez-vous pour donner votre avis
        </h3>
        <p className="text-creme/50 text-sm mb-4">
          Partagez votre expérience avec ce parfum
        </p>
        <Link href="/auth/signin" className="btn-luxury-outline text-sm">
          Se connecter
        </Link>
      </div>
    );
  }

  // Chargement
  if (status === "loading") {
    return (
      <div className="bg-noir-50 border border-or/20 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-noir-100 rounded w-1/3" />
          <div className="h-10 bg-noir-100 rounded" />
          <div className="h-24 bg-noir-100 rounded" />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Veuillez sélectionner une note");
      return;
    }

    if (comment.length < 10) {
      setError("Votre commentaire doit contenir au moins 10 caractères");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/reviews/${existingReview?.id}`
        : `/api/products/${productId}/reviews`;

      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title: title.trim() || null,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la soumission");
      }

      setSuccess(true);
      setIsEditing(false);
      onReviewSubmitted();

      // Reset après succès si nouvelle review
      if (!isEditing) {
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (existingReview) {
      setRating(existingReview.rating);
      setTitle(existingReview.title || "");
      setComment(existingReview.comment);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-noir-50 border border-or/20 rounded-lg p-6"
    >
      <h3 className="font-serif text-xl text-creme mb-6">
        {isEditing ? "Modifier votre avis" : "Donner votre avis"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Note */}
        <div>
          <label className="text-creme/60 text-xs tracking-wider uppercase mb-3 block">
            Votre note *
          </label>
          <ReviewStars
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
        </div>

        {/* Titre (optionnel) */}
        <div>
          <label className="text-creme/60 text-xs tracking-wider uppercase mb-3 block">
            Titre de l&apos;avis (optionnel)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Résumez votre expérience..."
            maxLength={100}
            className="w-full px-4 py-3 bg-noir border border-or/20 text-creme placeholder-creme/30
                       focus:outline-none focus:border-or transition-colors"
          />
        </div>

        {/* Commentaire */}
        <div>
          <label className="text-creme/60 text-xs tracking-wider uppercase mb-3 block">
            Votre avis *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec ce parfum..."
            rows={4}
            minLength={10}
            maxLength={1000}
            className="w-full px-4 py-3 bg-noir border border-or/20 text-creme placeholder-creme/30
                       focus:outline-none focus:border-or transition-colors resize-none"
          />
          <p className="text-creme/30 text-xs mt-2">
            {comment.length}/1000 caractères (minimum 10)
          </p>
        </div>

        {/* Erreur */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Succès */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
            >
              <p className="text-green-400 text-sm">
                Votre avis a été {isEditing ? "modifié" : "publié"} avec succès !
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boutons */}
        <div className="flex gap-4">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 btn-luxury disabled:opacity-50"
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
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
                Envoi en cours...
              </span>
            ) : isEditing ? (
              "Modifier mon avis"
            ) : (
              "Publier mon avis"
            )}
          </motion.button>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-or/30 text-creme/60 hover:text-creme hover:border-or/50 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}

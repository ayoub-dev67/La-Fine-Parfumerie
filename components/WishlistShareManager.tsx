'use client';

/**
 * WishlistShareManager - Component to manage wishlist sharing
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareStatus {
  shareId: string | null;
  isPublic: boolean;
  shareUrl: string | null;
}

export function WishlistShareManager() {
  const [status, setStatus] = useState<ShareStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    fetchShareStatus();
  }, []);

  const fetchShareStatus = async () => {
    try {
      const response = await fetch('/api/wishlist/share');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching share status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wishlist/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' })
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({
          shareId: data.shareId,
          isPublic: data.isPublic,
          shareUrl: data.shareUrl
        });
      }
    } catch (error) {
      console.error('Error generating link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wishlist/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' })
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(prev => prev ? {
          ...prev,
          isPublic: data.isPublic
        } : null);
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLink = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wishlist/share', {
        method: 'DELETE'
      });

      if (response.ok) {
        setStatus({
          shareId: null,
          isPublic: false,
          shareUrl: null
        });
      }
    } catch (error) {
      console.error('Error removing link:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!status?.shareUrl) return;

    try {
      await navigator.clipboard.writeText(status.shareUrl);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  if (loading && !status) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg border border-or/20">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-or border-t-transparent rounded-full animate-spin" />
          <span className="text-creme/60 text-sm">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-or/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-or/10 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-or" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </div>
        <div>
          <h3 className="text-creme font-medium">Partager ma wishlist</h3>
          <p className="text-creme/60 text-sm">
            {status?.isPublic ? 'Votre wishlist est visible' : 'Votre wishlist est privée'}
          </p>
        </div>
      </div>

      {!status?.shareId ? (
        <button
          onClick={handleGenerateLink}
          disabled={loading}
          className="w-full py-2 bg-or text-noir font-medium rounded-lg hover:bg-or/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Génération...' : 'Générer un lien de partage'}
        </button>
      ) : (
        <div className="space-y-3">
          {/* Share URL */}
          <div className="flex gap-2">
            <input
              type="text"
              value={status.shareUrl || ''}
              readOnly
              className="flex-1 px-3 py-2 bg-noir border border-or/20 rounded-lg text-creme text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="px-3 py-2 bg-or text-noir rounded-lg hover:bg-or/90 transition-colors"
            >
              <AnimatePresence mode="wait">
                {copying ? (
                  <motion.svg
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-creme/80 text-sm">Visibilité publique</span>
            <button
              onClick={handleToggleVisibility}
              disabled={loading}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                status.isPublic ? 'bg-or' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: status.isPublic ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
              />
            </button>
          </div>

          {/* Remove Link */}
          <button
            onClick={handleRemoveLink}
            disabled={loading}
            className="w-full py-2 text-red-400 text-sm hover:text-red-300 transition-colors disabled:opacity-50"
          >
            Supprimer le lien de partage
          </button>
        </div>
      )}
    </div>
  );
}

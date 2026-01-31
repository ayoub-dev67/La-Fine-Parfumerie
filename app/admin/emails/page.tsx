"use client";

/**
 * HISTORIQUE EMAILS - ADMIN
 * Liste des emails envoyés avec statistiques
 * Design noir/or luxe
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  type: string;
  status: string;
  createdAt: string;
  resendId: string | null;
}

interface EmailStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  last24h: number;
  last7days: number;
}

const EMAIL_TYPE_LABELS: Record<string, string> = {
  WELCOME: "Bienvenue",
  ORDER_CONFIRMATION: "Confirmation commande",
  SHIPPING: "Expedition",
  DELIVERY: "Livraison",
  REVIEW_REQUEST: "Demande avis",
  PASSWORD_RESET: "Reset mot de passe",
  PROMO: "Promotionnel",
};

const EMAIL_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  SENT: { label: "Envoye", color: "text-green-400" },
  FAILED: { label: "Echoue", color: "text-red-400" },
  BOUNCED: { label: "Rejete", color: "text-orange-400" },
  OPENED: { label: "Ouvert", color: "text-blue-400" },
  CLICKED: { label: "Clique", color: "text-purple-400" },
};

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterEmail, setFilterEmail] = useState<string>("");

  // Fetch emails
  const fetchEmails = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (filterType) params.set("type", filterType);
      if (filterStatus) params.set("status", filterStatus);
      if (filterEmail) params.set("email", filterEmail);

      const response = await fetch(`/api/admin/emails?${params}`);
      if (!response.ok) throw new Error("Erreur lors du chargement");

      const data = await response.json();
      setEmails(data.emails);
      setStats(data.stats);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [page, filterType, filterStatus]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchEmails();
      } else {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [filterEmail]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-noir p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchEmails();
              }}
              className="mt-4 px-4 py-2 bg-or text-noir text-sm font-medium hover:bg-or/90 transition-colors"
            >
              Reessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-creme mb-2">
            Historique des <span className="text-or">Emails</span>
          </h1>
          <p className="text-creme/60">
            Suivi de tous les emails envoyes par le systeme
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-noir-light border border-or/20 p-4"
            >
              <p className="text-creme/60 text-xs uppercase tracking-wider mb-1">
                Total
              </p>
              <p className="text-2xl font-light text-or">{stats.total}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-noir-light border border-or/20 p-4"
            >
              <p className="text-creme/60 text-xs uppercase tracking-wider mb-1">
                24 dernieres heures
              </p>
              <p className="text-2xl font-light text-creme">{stats.last24h}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-noir-light border border-or/20 p-4"
            >
              <p className="text-creme/60 text-xs uppercase tracking-wider mb-1">
                7 derniers jours
              </p>
              <p className="text-2xl font-light text-creme">{stats.last7days}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-noir-light border border-or/20 p-4"
            >
              <p className="text-creme/60 text-xs uppercase tracking-wider mb-1">
                Envoyes
              </p>
              <p className="text-2xl font-light text-green-400">
                {stats.byStatus.SENT || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-noir-light border border-or/20 p-4"
            >
              <p className="text-creme/60 text-xs uppercase tracking-wider mb-1">
                Echoues
              </p>
              <p className="text-2xl font-light text-red-400">
                {stats.byStatus.FAILED || 0}
              </p>
            </motion.div>
          </div>
        )}

        {/* Type breakdown */}
        {stats && (
          <div className="mb-8 bg-noir-light border border-or/20 p-4">
            <h3 className="text-sm text-creme/60 uppercase tracking-wider mb-4">
              Par type
            </h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="text-creme/80 text-sm">
                    {EMAIL_TYPE_LABELS[type] || type}:
                  </span>
                  <span className="text-or font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Rechercher par email..."
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 bg-noir border border-or/20 text-creme placeholder-creme/40 focus:outline-none focus:border-or"
          />

          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-noir border border-or/20 text-creme focus:outline-none focus:border-or cursor-pointer"
          >
            <option value="">Tous les types</option>
            {Object.entries(EMAIL_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-noir border border-or/20 text-creme focus:outline-none focus:border-or cursor-pointer"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(EMAIL_STATUS_LABELS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setFilterType("");
              setFilterStatus("");
              setFilterEmail("");
              setPage(1);
            }}
            className="px-4 py-2 border border-or/20 text-creme/60 hover:text-creme hover:border-or/40 transition-colors"
          >
            Reinitialiser
          </button>
        </div>

        {/* Results count */}
        <p className="text-creme/60 text-sm mb-4">
          {total} email{total > 1 ? "s" : ""} trouve{total > 1 ? "s" : ""}
        </p>

        {/* Table */}
        <div className="bg-noir-light border border-or/20 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-or/20 border-t-or rounded-full animate-spin mx-auto" />
              <p className="text-creme/60 mt-4">Chargement...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-creme/60">Aucun email trouve</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-or/20 bg-noir">
                    <th className="px-4 py-3 text-left text-xs text-creme/60 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-creme/60 uppercase tracking-wider">
                      Destinataire
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-creme/60 uppercase tracking-wider">
                      Sujet
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-creme/60 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-creme/60 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((email, index) => (
                    <motion.tr
                      key={email.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-or/10 hover:bg-or/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-creme/80">
                        {formatDate(email.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-creme">
                        {email.to}
                      </td>
                      <td className="px-4 py-3 text-sm text-creme/80 max-w-xs truncate">
                        {email.subject}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-or/10 text-or text-xs">
                          {EMAIL_TYPE_LABELS[email.type] || email.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-medium ${
                            EMAIL_STATUS_LABELS[email.status]?.color ||
                            "text-creme/60"
                          }`}
                        >
                          {EMAIL_STATUS_LABELS[email.status]?.label ||
                            email.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-or/20 text-creme disabled:opacity-50 disabled:cursor-not-allowed hover:border-or/40 transition-colors"
            >
              Precedent
            </button>
            <span className="px-4 py-2 text-creme/60">
              Page {page} sur {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-or/20 text-creme disabled:opacity-50 disabled:cursor-not-allowed hover:border-or/40 transition-colors"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

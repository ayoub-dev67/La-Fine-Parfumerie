"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: number;
  name: string;
  brand: string | null;
  image: string;
  price: number;
  category: string;
  volume: string | null;
}

interface SearchResponse {
  suggestions: string[];
  products: SearchResult[];
  total: number;
}

const HISTORY_KEY = "search_history";
const MAX_HISTORY = 5;

export default function SearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Charger l'historique depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  // Sauvegarder une recherche dans l'historique
  const saveToHistory = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      const filtered = prev.filter((h) => h.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Effacer l'historique
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  // Recherche avec debounce
  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=6`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Erreur recherche:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce la recherche
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      search(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, search]);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Soumettre la recherche
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToHistory(query);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  // Cliquer sur une suggestion ou historique
  const handleSuggestionClick = (term: string) => {
    saveToHistory(term);
    router.push(`/products?search=${encodeURIComponent(term)}`);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bouton de recherche (desktop) */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 px-3 py-2 text-creme/70 hover:text-or transition-colors"
        aria-label="Rechercher"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden xl:block text-sm tracking-wider uppercase">Rechercher</span>
      </button>

      {/* Overlay de recherche */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-noir/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal de recherche */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 left-0 right-0 z-50 p-4 pt-20 md:pt-24"
            >
              <div className="max-w-2xl mx-auto">
                {/* Barre de recherche */}
                <form onSubmit={handleSubmit} className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher un parfum, une marque, des notes..."
                    className="w-full px-6 py-4 pl-14 bg-noir-50 border border-or/30 text-creme text-lg
                               placeholder-creme/40 focus:outline-none focus:border-or transition-colors"
                    autoComplete="off"
                  />
                  <svg
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-or"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>

                  {/* Loading spinner */}
                  {isLoading && (
                    <div className="absolute right-14 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-or/30 border-t-or rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Bouton fermer */}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-creme/50 hover:text-creme transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>

                {/* Résultats / Suggestions / Historique */}
                <AnimatePresence mode="wait">
                  {(query.length >= 2 && results) ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 bg-noir-50 border border-or/20 max-h-[60vh] overflow-y-auto"
                    >
                      {/* Suggestions */}
                      {results.suggestions.length > 0 && (
                        <div className="p-4 border-b border-or/10">
                          <p className="text-creme/50 text-xs uppercase tracking-wider mb-2">
                            Suggestions
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {results.suggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-1.5 bg-or/10 text-or text-sm hover:bg-or/20 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Produits */}
                      {results.products.length > 0 ? (
                        <div className="p-4">
                          <p className="text-creme/50 text-xs uppercase tracking-wider mb-3">
                            Produits ({results.total})
                          </p>
                          <div className="space-y-3">
                            {results.products.map((product) => (
                              <Link
                                key={product.id}
                                href={`/products/${product.id}`}
                                onClick={() => {
                                  saveToHistory(query);
                                  setIsOpen(false);
                                  setQuery("");
                                }}
                                className="flex items-center gap-4 p-2 hover:bg-or/5 transition-colors group"
                              >
                                <div className="relative w-14 h-14 bg-noir flex-shrink-0 overflow-hidden">
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  {product.brand && (
                                    <span className="text-or text-[10px] tracking-[0.2em] uppercase">
                                      {product.brand}
                                    </span>
                                  )}
                                  <p className="text-creme font-serif truncate group-hover:text-or transition-colors">
                                    {product.name}
                                  </p>
                                  <p className="text-creme/50 text-xs">
                                    {product.volume} • {product.category}
                                  </p>
                                </div>
                                <span className="text-or font-serif">
                                  {product.price.toFixed(2)} €
                                </span>
                              </Link>
                            ))}
                          </div>

                          {/* Voir tous les résultats */}
                          <button
                            type="button"
                            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                            className="w-full mt-4 py-3 border border-or/30 text-or text-sm tracking-wider uppercase
                                       hover:bg-or/10 transition-colors"
                          >
                            Voir tous les resultats
                          </button>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-creme/50">Aucun produit trouve pour "{query}"</p>
                        </div>
                      )}
                    </motion.div>
                  ) : query.length === 0 && history.length > 0 ? (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 bg-noir-50 border border-or/20 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-creme/50 text-xs uppercase tracking-wider">
                          Recherches recentes
                        </p>
                        <button
                          type="button"
                          onClick={clearHistory}
                          className="text-creme/40 text-xs hover:text-red-400 transition-colors"
                        >
                          Effacer
                        </button>
                      </div>
                      <div className="space-y-1">
                        {history.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => handleSuggestionClick(term)}
                            className="flex items-center gap-3 w-full px-3 py-2 text-left text-creme/70
                                       hover:bg-or/5 hover:text-or transition-colors"
                          >
                            <svg className="w-4 h-4 text-creme/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {term}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

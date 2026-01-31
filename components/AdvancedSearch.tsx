'use client';

/**
 * AdvancedSearch - Composant de recherche avancée avec filtres
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AdvancedSearchProps {
  categories?: string[];
  brands?: string[];
  maxPriceLimit?: number;
  className?: string;
}

export function AdvancedSearch({
  categories = ['Homme', 'Femme', 'Niche', 'Signature', 'Coffret'],
  brands = [],
  maxPriceLimit = 500,
  className = '',
}: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: parseInt(searchParams.get('minPrice') || '0'),
    maxPrice: parseInt(searchParams.get('maxPrice') || maxPriceLimit.toString()),
    inStock: searchParams.get('inStock') === 'true',
    sortBy: searchParams.get('sortBy') || 'relevance',
  });

  const [isOpen, setIsOpen] = useState(false);

  // Sync avec URL params
  useEffect(() => {
    setFilters({
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      brand: searchParams.get('brand') || '',
      minPrice: parseInt(searchParams.get('minPrice') || '0'),
      maxPrice: parseInt(searchParams.get('maxPrice') || maxPriceLimit.toString()),
      inStock: searchParams.get('inStock') === 'true',
      sortBy: searchParams.get('sortBy') || 'relevance',
    });
  }, [searchParams, maxPriceLimit]);

  function handleSearch() {
    const params = new URLSearchParams();

    if (filters.q) params.set('q', filters.q);
    if (filters.category) params.set('category', filters.category);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < maxPriceLimit) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.sortBy !== 'relevance') params.set('sortBy', filters.sortBy);

    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
  }

  function handleReset() {
    setFilters({
      q: '',
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: maxPriceLimit,
      inStock: false,
      sortBy: 'relevance',
    });
  }

  const activeFiltersCount = [
    filters.category,
    filters.brand,
    filters.minPrice > 0,
    filters.maxPrice < maxPriceLimit,
    filters.inStock,
  ].filter(Boolean).length;

  return (
    <div className={`${className}`}>
      {/* Barre de recherche principale */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher un parfum..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-3 bg-noir border border-or/30 rounded-lg text-creme placeholder-creme/40 focus:border-or focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-or hover:text-or/80"
            aria-label="Rechercher"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-3 border rounded-lg flex items-center gap-2 transition-colors ${
            activeFiltersCount > 0
              ? 'bg-or text-noir border-or'
              : 'bg-noir border-or/30 text-creme hover:border-or'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="hidden sm:inline">Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 flex items-center justify-center bg-noir text-or text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Panneau de filtres avancés */}
      {isOpen && (
        <div className="bg-noir/80 backdrop-blur-sm border border-or/20 rounded-xl p-6 mb-6 animate-slide-down">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Catégorie */}
            <div>
              <label className="block text-sm text-creme/70 mb-2">Catégorie</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 bg-noir border border-or/30 rounded-lg text-creme focus:border-or focus:outline-none"
              >
                <option value="">Toutes</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Marque */}
            {brands.length > 0 && (
              <div>
                <label className="block text-sm text-creme/70 mb-2">Marque</label>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-noir border border-or/30 rounded-lg text-creme focus:border-or focus:outline-none"
                >
                  <option value="">Toutes</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Prix */}
            <div>
              <label className="block text-sm text-creme/70 mb-2">
                Prix : {filters.minPrice}€ - {filters.maxPrice}€
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max={maxPriceLimit}
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
                  className="w-1/2 px-2 py-2 bg-noir border border-or/30 rounded-lg text-creme text-sm focus:border-or focus:outline-none"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min="0"
                  max={maxPriceLimit}
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || maxPriceLimit })}
                  className="w-1/2 px-2 py-2 bg-noir border border-or/30 rounded-lg text-creme text-sm focus:border-or focus:outline-none"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Tri */}
            <div>
              <label className="block text-sm text-creme/70 mb-2">Trier par</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-3 py-2 bg-noir border border-or/30 rounded-lg text-creme focus:border-or focus:outline-none"
              >
                <option value="relevance">Pertinence</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="newest">Nouveautés</option>
                <option value="bestseller">Meilleures ventes</option>
                <option value="name_asc">Nom A-Z</option>
                <option value="name_desc">Nom Z-A</option>
              </select>
            </div>
          </div>

          {/* Options supplémentaires */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                className="w-4 h-4 rounded border-or/30 bg-noir text-or focus:ring-or"
              />
              <span className="text-sm text-creme/70">En stock uniquement</span>
            </label>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-creme/60 hover:text-creme transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-or text-noir font-semibold rounded-lg hover:bg-or/90 transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

interface ProductFiltersProps {
  products: Product[];
  categories: string[];
  brands: string[];
  volumes?: string[];
}

type SortOption = "featured" | "price-asc" | "price-desc" | "newest" | "bestseller" | "rating";

interface Filters {
  category: string;
  brand: string;
  search: string;
  sort: SortOption;
  priceMin: number;
  priceMax: number;
  inStock: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  volumes: string[];
}

export default function ProductFilters({
  products,
  categories,
  brands,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extraire les volumes uniques des produits
  const availableVolumes = useMemo(() => {
    const vols = new Set<string>();
    products.forEach((p) => {
      if (p.volume) vols.add(p.volume);
    });
    return Array.from(vols).sort();
  }, [products]);

  // Calculate price range
  const { minPrice, maxPrice } = useMemo(() => {
    const prices = products.map((p) => Number(p.price));
    return {
      minPrice: Math.floor(Math.min(...prices, 0)),
      maxPrice: Math.ceil(Math.max(...prices, 1000)),
    };
  }, [products]);

  // Initialiser les filtres depuis l'URL
  const getInitialFilters = useCallback((): Filters => ({
    category: searchParams.get("category") || "Tous",
    brand: searchParams.get("brand") || "Toutes",
    search: searchParams.get("search") || "",
    sort: (searchParams.get("sort") as SortOption) || "featured",
    priceMin: parseInt(searchParams.get("priceMin") || String(minPrice)),
    priceMax: parseInt(searchParams.get("priceMax") || String(maxPrice)),
    inStock: searchParams.get("inStock") === "true",
    isNew: searchParams.get("isNew") === "true",
    isBestSeller: searchParams.get("isBestSeller") === "true",
    volumes: searchParams.get("volumes")?.split(",").filter(Boolean) || [],
  }), [searchParams, minPrice, maxPrice]);

  const [filters, setFilters] = useState<Filters>(getInitialFilters);
  const [showFilters, setShowFilters] = useState(false);

  // Sync filters with URL on mount
  useEffect(() => {
    setFilters(getInitialFilters());
  }, [getInitialFilters]);

  // Update URL when filters change
  const updateURL = useCallback((newFilters: Filters) => {
    const params = new URLSearchParams();

    if (newFilters.category !== "Tous") params.set("category", newFilters.category);
    if (newFilters.brand !== "Toutes") params.set("brand", newFilters.brand);
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.sort !== "featured") params.set("sort", newFilters.sort);
    if (newFilters.priceMin > minPrice) params.set("priceMin", String(newFilters.priceMin));
    if (newFilters.priceMax < maxPrice) params.set("priceMax", String(newFilters.priceMax));
    if (newFilters.inStock) params.set("inStock", "true");
    if (newFilters.isNew) params.set("isNew", "true");
    if (newFilters.isBestSeller) params.set("isBestSeller", "true");
    if (newFilters.volumes.length > 0) params.set("volumes", newFilters.volumes.join(","));

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [router, pathname, minPrice, maxPrice]);

  // Update a single filter
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Toggle volume filter
  const toggleVolume = (volume: string) => {
    const newVolumes = filters.volumes.includes(volume)
      ? filters.volumes.filter((v) => v !== volume)
      : [...filters.volumes, volume];
    updateFilter("volumes", newVolumes);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (filters.category !== "Tous") {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    // Brand filter
    if (filters.brand !== "Toutes") {
      filtered = filtered.filter((p) => p.brand === filters.brand);
    }

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          (p.brand && p.brand.toLowerCase().includes(query)) ||
          (p.notesTop && p.notesTop.toLowerCase().includes(query)) ||
          (p.notesHeart && p.notesHeart.toLowerCase().includes(query)) ||
          (p.notesBase && p.notesBase.toLowerCase().includes(query))
      );
    }

    // Price filter
    filtered = filtered.filter(
      (p) => Number(p.price) >= filters.priceMin && Number(p.price) <= filters.priceMax
    );

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // New filter
    if (filters.isNew) {
      filtered = filtered.filter((p) => p.isNew);
    }

    // Best-seller filter
    if (filters.isBestSeller) {
      filtered = filtered.filter((p) => p.isBestSeller);
    }

    // Volume filter
    if (filters.volumes.length > 0) {
      filtered = filtered.filter((p) => p.volume && filters.volumes.includes(p.volume));
    }

    // Sort
    switch (filters.sort) {
      case "price-asc":
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "newest":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "bestseller":
        filtered.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case "featured":
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return filtered;
  }, [products, filters]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "Tous") count++;
    if (filters.brand !== "Toutes") count++;
    if (filters.search) count++;
    if (filters.priceMin > minPrice || filters.priceMax < maxPrice) count++;
    if (filters.inStock) count++;
    if (filters.isNew) count++;
    if (filters.isBestSeller) count++;
    if (filters.volumes.length > 0) count++;
    return count;
  }, [filters, minPrice, maxPrice]);

  const resetFilters = () => {
    const defaultFilters: Filters = {
      category: "Tous",
      brand: "Toutes",
      search: "",
      sort: "featured",
      priceMin: minPrice,
      priceMax: maxPrice,
      inStock: false,
      isNew: false,
      isBestSeller: false,
      volumes: [],
    };
    setFilters(defaultFilters);
    router.push(pathname);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full py-3 px-4 bg-noir-50 border border-or/20 flex items-center justify-between text-creme"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-or" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-or text-noir text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${showFilters ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
        <div className="bg-noir-50 border border-or/10 p-6 sticky top-24 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-creme">Filtres</h2>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-or hover:text-or-light transition-colors tracking-wider uppercase flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reinitialiser ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Sort */}
          <div>
            <label className="block text-creme/60 text-xs tracking-wider uppercase mb-2">
              Trier par
            </label>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value as SortOption)}
              aria-label="Trier par"
              className="w-full px-4 py-2.5 bg-noir border border-or/20 text-creme text-sm focus:outline-none focus:border-or cursor-pointer"
            >
              <option value="featured">Coups de coeur</option>
              <option value="newest">Nouveautes</option>
              <option value="bestseller">Best-sellers</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix decroissant</option>
            </select>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-creme/60 text-xs tracking-wider uppercase mb-2">
              Categorie
            </label>
            <div className="space-y-0.5">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => updateFilter("category", category)}
                  className={`w-full text-left px-3 py-2 text-sm transition-all ${
                    filters.category === category
                      ? "bg-or text-noir font-medium"
                      : "text-creme/70 hover:text-or hover:bg-or/5"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <label className="block text-creme/60 text-xs tracking-wider uppercase mb-2">
              Marque
            </label>
            <div className="space-y-0.5 max-h-40 overflow-y-auto">
              <button
                type="button"
                onClick={() => updateFilter("brand", "Toutes")}
                className={`w-full text-left px-3 py-2 text-sm transition-all ${
                  filters.brand === "Toutes"
                    ? "bg-or text-noir font-medium"
                    : "text-creme/70 hover:text-or hover:bg-or/5"
                }`}
              >
                Toutes les marques
              </button>
              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => updateFilter("brand", brand)}
                  className={`w-full text-left px-3 py-2 text-sm transition-all ${
                    filters.brand === brand
                      ? "bg-or text-noir font-medium"
                      : "text-creme/70 hover:text-or hover:bg-or/5"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <label className="block text-creme/60 text-xs tracking-wider uppercase mb-2">
              Prix : {filters.priceMin}€ - {filters.priceMax}€
            </label>
            <div className="space-y-3 px-1">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={minPrice}
                  max={filters.priceMax - 1}
                  value={filters.priceMin}
                  onChange={(e) => updateFilter("priceMin", Math.max(minPrice, parseInt(e.target.value) || minPrice))}
                  aria-label="Prix minimum"
                  className="w-20 px-2 py-1.5 bg-noir border border-or/20 text-creme text-sm focus:outline-none focus:border-or"
                />
                <div className="flex-1 h-px bg-or/20" />
                <input
                  type="number"
                  min={filters.priceMin + 1}
                  max={maxPrice}
                  value={filters.priceMax}
                  onChange={(e) => updateFilter("priceMax", Math.min(maxPrice, parseInt(e.target.value) || maxPrice))}
                  aria-label="Prix maximum"
                  className="w-20 px-2 py-1.5 bg-noir border border-or/20 text-creme text-sm focus:outline-none focus:border-or"
                />
              </div>
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={filters.priceMin}
                onChange={(e) => updateFilter("priceMin", Math.min(parseInt(e.target.value), filters.priceMax - 10))}
                aria-label="Slider prix minimum"
                className="w-full accent-or"
              />
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={filters.priceMax}
                onChange={(e) => updateFilter("priceMax", Math.max(parseInt(e.target.value), filters.priceMin + 10))}
                aria-label="Slider prix maximum"
                className="w-full accent-or"
              />
            </div>
          </div>

          {/* Volumes */}
          {availableVolumes.length > 0 && (
            <div>
              <label className="block text-creme/60 text-xs tracking-wider uppercase mb-2">
                Volume
              </label>
              <div className="flex flex-wrap gap-2">
                {availableVolumes.map((volume) => (
                  <button
                    key={volume}
                    type="button"
                    onClick={() => toggleVolume(volume)}
                    className={`px-3 py-1.5 text-xs border transition-all ${
                      filters.volumes.includes(volume)
                        ? "bg-or text-noir border-or"
                        : "border-or/20 text-creme/70 hover:border-or/50"
                    }`}
                  >
                    {volume}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Badges / Quick filters */}
          <div>
            <label className="block text-creme/60 text-xs tracking-wider uppercase mb-2">
              Filtres rapides
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => updateFilter("inStock", e.target.checked)}
                  className="w-4 h-4 accent-or"
                />
                <span className="text-sm text-creme/70 group-hover:text-creme flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  En stock uniquement
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.isNew}
                  onChange={(e) => updateFilter("isNew", e.target.checked)}
                  className="w-4 h-4 accent-or"
                />
                <span className="text-sm text-creme/70 group-hover:text-creme">
                  Nouveautes
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.isBestSeller}
                  onChange={(e) => updateFilter("isBestSeller", e.target.checked)}
                  className="w-4 h-4 accent-or"
                />
                <span className="text-sm text-creme/70 group-hover:text-creme">
                  Best-sellers
                </span>
              </label>
            </div>
          </div>

          {/* Results count */}
          <div className="pt-4 border-t border-or/10">
            <p className="text-creme/50 text-sm">
              <span className="text-or font-serif text-xl">
                {filteredProducts.length}
              </span>{" "}
              parfum{filteredProducts.length !== 1 ? "s" : ""} trouve
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </aside>

      {/* Products grid */}
      <div className="lg:col-span-3">
        {/* Active filters tags */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-creme/50 text-sm">Filtres actifs:</span>
            {filters.category !== "Tous" && (
              <FilterTag
                label={filters.category}
                onRemove={() => updateFilter("category", "Tous")}
              />
            )}
            {filters.brand !== "Toutes" && (
              <FilterTag
                label={filters.brand}
                onRemove={() => updateFilter("brand", "Toutes")}
              />
            )}
            {filters.search && (
              <FilterTag
                label={`"${filters.search}"`}
                onRemove={() => updateFilter("search", "")}
              />
            )}
            {(filters.priceMin > minPrice || filters.priceMax < maxPrice) && (
              <FilterTag
                label={`${filters.priceMin}€ - ${filters.priceMax}€`}
                onRemove={() => {
                  setFilters({ ...filters, priceMin: minPrice, priceMax: maxPrice });
                  updateURL({ ...filters, priceMin: minPrice, priceMax: maxPrice });
                }}
              />
            )}
            {filters.inStock && (
              <FilterTag label="En stock" onRemove={() => updateFilter("inStock", false)} />
            )}
            {filters.isNew && (
              <FilterTag label="Nouveautes" onRemove={() => updateFilter("isNew", false)} />
            )}
            {filters.isBestSeller && (
              <FilterTag label="Best-sellers" onRemove={() => updateFilter("isBestSeller", false)} />
            )}
            {filters.volumes.map((v) => (
              <FilterTag key={v} label={v} onRemove={() => toggleVolume(v)} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-8 border border-or/20 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-or/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-creme mb-4">
                Aucun parfum trouve
              </h3>
              <p className="text-creme/50 mb-8 max-w-md mx-auto">
                Essayez de modifier vos criteres de recherche ou vos filtres
                pour decouvrir notre collection.
              </p>
              <button type="button" onClick={resetFilters} className="btn-luxury">
                Reinitialiser les filtres
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Composant tag de filtre actif
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-or/10 text-or text-sm">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Supprimer le filtre ${label}`}
        className="hover:text-red-400 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

'use client';

/**
 * ExportButton - Bouton d'export CSV avec dropdown
 */

import { useState, useRef, useEffect } from 'react';

type ExportType = 'products' | 'orders' | 'customers';

const EXPORT_OPTIONS: Array<{ type: ExportType; label: string; icon: string }> = [
  { type: 'products', label: 'Produits', icon: '📦' },
  { type: 'orders', label: 'Commandes', icon: '🛒' },
  { type: 'customers', label: 'Clients', icon: '👥' },
];

export function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleExport(type: ExportType) {
    setExporting(type);
    try {
      const response = await fetch(`/api/admin/export/${type}`);

      if (!response.ok) {
        throw new Error('Erreur export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Récupérer le nom du fichier depuis le header
      const disposition = response.headers.get('Content-Disposition');
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      a.download = filenameMatch ? filenameMatch[1] : `export_${type}.csv`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setIsOpen(false);
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-noir border border-or/30 rounded-lg text-creme hover:border-or transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>Exporter</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-noir border border-or/30 rounded-lg shadow-xl z-50 overflow-hidden">
          {EXPORT_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => handleExport(option.type)}
              disabled={exporting !== null}
              className="w-full px-4 py-3 text-left text-creme hover:bg-or/10 transition-colors flex items-center gap-3 disabled:opacity-50"
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
              {exporting === option.type && (
                <span className="ml-auto animate-spin">⏳</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

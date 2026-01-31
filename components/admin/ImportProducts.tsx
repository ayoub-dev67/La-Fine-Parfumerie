'use client';

/**
 * ImportProducts - Composant d'import CSV de produits
 */

import { useState, useRef } from 'react';

interface ImportResult {
  success: boolean;
  message: string;
  created: number;
  updated: number;
  errors: Array<{ line: number; errors: string[] }>;
}

interface ImportProductsProps {
  onSuccess?: () => void;
}

export function ImportProducts({ onSuccess }: ImportProductsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setResult(null);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  }

  async function handleImport() {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/import/products', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      if (data.success && data.errors.length === 0) {
        setTimeout(() => {
          setIsOpen(false);
          setFile(null);
          setResult(null);
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.reload();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur import:', error);
      setResult({
        success: false,
        message: 'Erreur lors de l\'import',
        created: 0,
        updated: 0,
        errors: [],
      });
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const template = `name;brand;description;price;volume;category;stock;notesTop;notesHeart;notesBase;isFeatured;isNew;isBestSeller;image
Exemple Parfum;Marque;Description du parfum;99.90;100ml;Homme;10;Bergamote, Citron;Rose, Jasmin;Musc, Vanille;Non;Oui;Non;https://example.com/image.jpg`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_produits.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-or text-noir font-semibold rounded-lg hover:bg-or/90 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        <span>Importer</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-noir border border-or/30 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-or">Importer des produits</h2>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setFile(null);
                    setResult(null);
                  }}
                  className="text-creme/50 hover:text-creme"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Template download */}
              <div className="mb-6">
                <button
                  onClick={downloadTemplate}
                  className="text-or hover:text-or/80 text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger le template CSV
                </button>
              </div>

              {/* Drag & drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-or bg-or/10'
                    : file
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-or/30 hover:border-or/50'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {file ? (
                  <div>
                    <span className="text-green-400 text-3xl mb-2 block">✓</span>
                    <p className="text-creme">{file.name}</p>
                    <p className="text-sm text-creme/50">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-12 h-12 mx-auto mb-4 text-or/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-creme mb-1">Glissez votre fichier CSV ici</p>
                    <p className="text-sm text-creme/50">ou cliquez pour sélectionner</p>
                  </div>
                )}
              </div>

              {/* Résultat */}
              {result && (
                <div className={`mt-4 p-4 rounded-lg ${
                  result.success && result.errors.length === 0
                    ? 'bg-green-500/20 border border-green-500/30'
                    : result.errors.length > 0
                    ? 'bg-yellow-500/20 border border-yellow-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  <p className={`font-medium ${
                    result.success && result.errors.length === 0 ? 'text-green-400' :
                    result.errors.length > 0 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {result.message}
                  </p>

                  {result.errors.length > 0 && (
                    <div className="mt-3 max-h-40 overflow-y-auto">
                      <p className="text-sm text-creme/70 mb-2">Erreurs :</p>
                      {result.errors.slice(0, 10).map((err, i) => (
                        <div key={i} className="text-xs text-red-400 mb-1">
                          Ligne {err.line}: {err.errors.join(', ')}
                        </div>
                      ))}
                      {result.errors.length > 10 && (
                        <p className="text-xs text-creme/50">
                          ... et {result.errors.length - 10} autres erreurs
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setFile(null);
                    setResult(null);
                  }}
                  className="px-4 py-2 text-creme/60 hover:text-creme transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || importing}
                  className="px-6 py-2 bg-or text-noir font-semibold rounded-lg hover:bg-or/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? 'Import en cours...' : 'Importer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

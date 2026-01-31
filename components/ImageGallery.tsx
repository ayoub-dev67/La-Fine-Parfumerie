'use client';

/**
 * ImageGallery - Product image gallery with zoom and thumbnails
 * Uses react-medium-image-zoom for smooth zoom experience
 */

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export function ImageGallery({ images, productName, className = '' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Ensure we have at least one image
  const galleryImages = images.length > 0 ? images : ['/images/placeholder.jpg'];

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  }, [galleryImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  }, [galleryImages.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setIsFullscreen(false);
  }, [handlePrevious, handleNext]);

  return (
    <div className={`relative ${className}`} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Main Image with Zoom */}
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        <Zoom
          zoomMargin={40}
          classDialog="custom-zoom-dialog"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <Image
                src={galleryImages[selectedIndex]}
                alt={`${productName} - Image ${selectedIndex + 1}`}
                fill
                className="object-cover cursor-zoom-in"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={selectedIndex === 0}
              />
            </motion.div>
          </AnimatePresence>
        </Zoom>

        {/* Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-noir/70 backdrop-blur-sm border border-or/30 rounded-full flex items-center justify-center text-creme hover:bg-or hover:text-noir transition-colors z-10"
              aria-label="Image précédente"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-noir/70 backdrop-blur-sm border border-or/30 rounded-full flex items-center justify-center text-creme hover:bg-or hover:text-noir transition-colors z-10"
              aria-label="Image suivante"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 w-10 h-10 bg-noir/70 backdrop-blur-sm border border-or/30 rounded-full flex items-center justify-center text-creme hover:bg-or hover:text-noir transition-colors z-10"
          aria-label="Plein écran"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        {/* Image Counter */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-noir/70 backdrop-blur-sm rounded-full text-creme text-sm">
            {selectedIndex + 1} / {galleryImages.length}
          </div>
        )}

        {/* Zoom Hint */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-noir/70 backdrop-blur-sm rounded text-creme/60 text-xs flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          Cliquez pour zoomer
        </div>
      </div>

      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {galleryImages.map((image, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all ${
                index === selectedIndex
                  ? 'ring-2 ring-or'
                  : 'ring-1 ring-or/20 hover:ring-or/50'
              }`}
              aria-label={`Voir image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} - Miniature ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
              {index === selectedIndex && (
                <div className="absolute inset-0 bg-or/10" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-noir/95 backdrop-blur-lg flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-noir/70 border border-or/30 rounded-full flex items-center justify-center text-creme hover:bg-or hover:text-noir transition-colors z-50"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-noir/70 border border-or/30 rounded-full flex items-center justify-center text-creme hover:bg-or hover:text-noir transition-colors z-50"
                  aria-label="Image précédente"
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-noir/70 border border-or/30 rounded-full flex items-center justify-center text-creme hover:bg-or hover:text-noir transition-colors z-50"
                  aria-label="Image suivante"
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Fullscreen Image */}
            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-[90vw] max-h-[90vh] aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={galleryImages[selectedIndex]}
                alt={`${productName} - Image ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </motion.div>

            {/* Counter */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-noir/70 backdrop-blur-sm rounded-full text-creme">
                {selectedIndex + 1} / {galleryImages.length}
              </div>
            )}

            {/* Thumbnails */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2">
              {galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(index); }}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden transition-all ${
                    index === selectedIndex
                      ? 'ring-2 ring-or'
                      : 'ring-1 ring-white/20 hover:ring-white/50'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Miniature ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom CSS for zoom dialog */}
      <style jsx global>{`
        .custom-zoom-dialog [data-rmiz-modal-overlay] {
          background-color: rgba(10, 10, 10, 0.95);
        }
        .custom-zoom-dialog [data-rmiz-modal-content] {
          background-color: transparent;
        }
      `}</style>
    </div>
  );
}

/**
 * Simple Image Zoom - Single image with zoom capability
 */
interface SimpleZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export function SimpleZoom({ src, alt, className = '' }: SimpleZoomProps) {
  return (
    <Zoom zoomMargin={40}>
      <Image
        src={src}
        alt={alt}
        width={400}
        height={400}
        className={`cursor-zoom-in ${className}`}
      />
    </Zoom>
  );
}

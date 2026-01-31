'use client';

/**
 * Skeleton Components - Loading placeholders
 * Elegant skeleton loaders for various content types
 */

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

// Base skeleton with shimmer effect
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-800 rounded ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear'
        }}
      />
    </div>
  );
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-noir-50 overflow-hidden rounded-lg">
      {/* Image */}
      <Skeleton className="aspect-perfume w-full" />

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Brand */}
        <Skeleton className="h-3 w-20" />

        {/* Name */}
        <Skeleton className="h-5 w-3/4" />

        {/* Volume */}
        <Skeleton className="h-3 w-16" />

        {/* Price and stock */}
        <div className="flex items-end justify-between pt-2 border-t border-noir-100">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// Product grid skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Cart item skeleton
export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 border-b border-or/10">
      <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

// Order summary skeleton
export function OrderSummarySkeleton() {
  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-or/20 space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex justify-between pt-3 border-t border-or/10">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

// Review skeleton
export function ReviewSkeleton() {
  return (
    <div className="p-4 border-b border-or/10">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}

// Text line skeletons
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/5' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

// Profile header skeleton
export function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-or/20">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// Image gallery skeleton
export function ImageGallerySkeleton() {
  return (
    <div>
      <Skeleton className="aspect-square w-full rounded-lg mb-4" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-16 h-16 rounded-md" />
        ))}
      </div>
    </div>
  );
}

// Chat message skeleton
export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] p-3 rounded-2xl ${
        isUser ? 'bg-or/20 rounded-br-md' : 'bg-gray-800 rounded-bl-md'
      }`}>
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

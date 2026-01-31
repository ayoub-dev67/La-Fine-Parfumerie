'use client';

/**
 * ProductReveal - Stagger animation for product grid
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ProductRevealProps {
  children: ReactNode;
  index?: number;
  className?: string;
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: index * 0.1,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function ProductReveal({ children, index = 0, className = '' }: ProductRevealProps) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ProductGrid - Container for staggered product grid
 */
interface ProductGridProps {
  children: ReactNode;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const gridItemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function ProductGrid({ children, className = '' }: ProductGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ProductGridItem({ children, className = '' }: ProductGridProps) {
  return (
    <motion.div variants={gridItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * HoverCard - Card with hover effects
 */
interface HoverCardProps {
  children: ReactNode;
  className?: string;
}

export function HoverCard({ children, className = '' }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        y: -5,
        boxShadow: '0 20px 40px rgba(197, 160, 89, 0.15)',
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * GlowOnHover - Adds golden glow effect on hover
 */
export function GlowOnHover({ children, className = '' }: HoverCardProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover="hover"
      initial="rest"
    >
      <motion.div
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-or/0 via-or/20 to-or/0 blur-xl"
        variants={{
          rest: { opacity: 0, scale: 0.8 },
          hover: { opacity: 1, scale: 1.1 },
        }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

'use client';

/**
 * CartSlideIn - Slide-in animation for cart drawer
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface CartSlideInProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: {
    x: '100%',
    opacity: 0.8,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '100%',
    opacity: 0.8,
    transition: {
      duration: 0.3,
      ease: 'easeIn' as const,
    },
  },
};

export function CartSlideIn({ isOpen, onClose, children }: CartSlideInProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-noir border-l border-or/30 z-50 shadow-2xl"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * SlideInFromLeft - Slide in from left variant
 */
interface SlideInProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}

const leftDrawerVariants = {
  hidden: {
    x: '-100%',
    opacity: 0.8,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0.8,
    transition: {
      duration: 0.3,
      ease: 'easeIn' as const,
    },
  },
};

export function SlideInFromLeft({ isOpen, onClose, children, width = 'max-w-md' }: SlideInProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          <motion.div
            className={`fixed left-0 top-0 h-full w-full ${width} bg-noir border-r border-or/30 z-50 shadow-2xl`}
            variants={leftDrawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * SlideInFromBottom - For mobile sheets
 */
const bottomSheetVariants = {
  hidden: {
    y: '100%',
    opacity: 0.8,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: '100%',
    opacity: 0.8,
    transition: {
      duration: 0.3,
      ease: 'easeIn' as const,
    },
  },
};

export function SlideInFromBottom({ isOpen, onClose, children }: SlideInProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-noir border-t border-or/30 rounded-t-2xl z-50 shadow-2xl overflow-hidden"
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Drag handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-or/30 rounded-full" />
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

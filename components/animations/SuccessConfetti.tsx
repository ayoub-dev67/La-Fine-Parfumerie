'use client';

/**
 * SuccessConfetti - Confetti animation for successful purchase
 */

import { useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

interface SuccessConfettiProps {
  trigger?: boolean;
  duration?: number;
  colors?: string[];
}

export function SuccessConfetti({
  trigger = true,
  duration = 3000,
  colors = ['#c5a059', '#FFD700', '#FFA500', '#FFFFFF', '#F0E68C'],
}: SuccessConfettiProps) {
  const hasTriggered = useRef(false);

  const fireConfetti = useCallback(() => {
    const end = Date.now() + duration;

    const frame = () => {
      // Left side burst
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
        startVelocity: 45,
        gravity: 1.2,
        drift: 0,
        ticks: 200,
        decay: 0.94,
        scalar: 1,
        shapes: ['circle', 'square'],
      });

      // Right side burst
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
        startVelocity: 45,
        gravity: 1.2,
        drift: 0,
        ticks: 200,
        decay: 0.94,
        scalar: 1,
        shapes: ['circle', 'square'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Big center burst
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors,
      startVelocity: 30,
      gravity: 0.8,
      ticks: 300,
      decay: 0.92,
      scalar: 1.2,
      shapes: ['circle', 'square'],
    });
  }, [duration, colors]);

  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;
      // Small delay for page to render
      const timer = setTimeout(fireConfetti, 300);
      return () => clearTimeout(timer);
    }
  }, [trigger, fireConfetti]);

  return null; // This component doesn't render anything
}

/**
 * Celebration - Multiple burst effects
 */
export function Celebration() {
  useEffect(() => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 100,
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#c5a059', '#FFD700', '#FFA500'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#c5a059', '#FFD700', '#FFA500'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return null;
}

/**
 * FireworksBurst - Single fireworks-like burst
 */
export function FireworksBurst({
  x = 0.5,
  y = 0.5,
}: {
  x?: number;
  y?: number;
}) {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      colors: ['#c5a059', '#FFD700', '#FFA500', '#FFFFFF'],
      startVelocity: 45,
      gravity: 1,
      ticks: 300,
    });
  }, [x, y]);

  return null;
}

/**
 * Hook to trigger confetti programmatically
 */
export function useConfetti() {
  const fire = useCallback((options?: confetti.Options) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#c5a059', '#FFD700', '#FFA500', '#FFFFFF'],
      ...options,
    });
  }, []);

  const celebrate = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#c5a059', '#FFD700', '#FFA500', '#FFFFFF'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  return { fire, celebrate };
}

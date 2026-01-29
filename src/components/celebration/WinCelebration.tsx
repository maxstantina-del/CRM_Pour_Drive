/**
 * Win celebration with confetti animation
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

export interface WinCelebrationProps {
  isVisible: boolean;
  leadName: string;
}

export function WinCelebration({ isVisible, leadName }: WinCelebrationProps) {
  useEffect(() => {
    if (isVisible) {
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="mb-6"
            >
              <Trophy className="mx-auto text-yellow-500" size={96} />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Félicitations ! 🎉</h2>
            <p className="text-lg text-gray-600">
              <strong>{leadName}</strong> est gagné !
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

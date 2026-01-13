import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';

interface WinCelebrationProps {
  isVisible: boolean;
  leadName: string;
  onComplete?: () => void;
}

export function WinCelebration({ isVisible, leadName, onComplete }: WinCelebrationProps) {
  useEffect(() => {
    if (!isVisible) return;

    // Lancer les confettis
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        if (onComplete) onComplete();
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Confettis depuis le bas gauche
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });

      // Confettis depuis le bas droit
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9998] pointer-events-none"
        >
          <div className="flex flex-col items-center gap-4 p-8 glass rounded-2xl border-2 border-yellow-400/50 shadow-2xl">
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
            >
              <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            </motion.div>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Félicitations !</h2>
              <p className="text-xl text-gray-200">{leadName}</p>
              <p className="text-lg text-green-400 font-semibold mt-1">Lead gagné !</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

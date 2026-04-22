/**
 * Small confetti burst when a lead is moved to a winning stage.
 * Uses canvas-confetti which runs on its own canvas — zero React re-renders.
 */

import confetti from 'canvas-confetti';

export function fireWinConfetti(): void {
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 100,
    disableForReducedMotion: true,
  };

  const colors = ['#FFD700', '#10B981', '#059669', '#3B82F6', '#F59E0B'];

  // Two bursts from bottom-left and bottom-right for symmetry
  confetti({
    ...defaults,
    particleCount: 70,
    origin: { x: 0.3, y: 0.8 },
    colors,
  });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 70,
      origin: { x: 0.7, y: 0.8 },
      colors,
    });
  }, 200);
}

import { useEffect, useState } from 'react';

/**
 * Hook global pour gérer un seul intervalle partagé par tous les composants
 * Au lieu de créer 100+ setInterval (un par LeadCard), on en crée un seul
 * qui "tick" toutes les minutes et force un re-render de tous les composants abonnés
 */

let globalListeners: Set<() => void> = new Set();
let globalInterval: NodeJS.Timeout | null = null;

function startGlobalTimer() {
  if (globalInterval) return; // Déjà démarré

  globalInterval = setInterval(() => {
    // Notifie tous les composants abonnés
    globalListeners.forEach(listener => listener());
  }, 60000); // Toutes les 60 secondes
}

function stopGlobalTimer() {
  if (globalInterval) {
    clearInterval(globalInterval);
    globalInterval = null;
  }
}

/**
 * Hook à utiliser dans les composants qui ont besoin de se mettre à jour toutes les minutes
 * Retourne un nombre qui change toutes les 60 secondes pour forcer le re-render
 */
export function useGlobalTimer() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(prev => prev + 1);

    // Ajoute le listener
    globalListeners.add(listener);

    // Démarre le timer global si pas déjà fait
    startGlobalTimer();

    return () => {
      // Retire le listener
      globalListeners.delete(listener);

      // Si plus aucun listener, arrête le timer global
      if (globalListeners.size === 0) {
        stopGlobalTimer();
      }
    };
  }, []);

  return tick;
}

/**
 * Fonction utilitaire pour calculer le label et le status d'un countdown
 */
export function calculateCountdown(date: string, time?: string): {
  label: string;
  status: 'normal' | 'late' | 'today';
} {
  const now = new Date();
  const actionDate = new Date(date);

  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    actionDate.setHours(hours, minutes, 0, 0);
  } else {
    actionDate.setHours(0, 0, 0, 0);
  }

  const diff = actionDate.getTime() - now.getTime();
  const diffHours = diff / (1000 * 60 * 60);

  if (diff < 0) {
    return { label: 'En retard', status: 'late' };
  } else if (diffHours < 24) {
    const h = Math.floor(diffHours);
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      label: `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`,
      status: 'today'
    };
  } else {
    const days = Math.floor(diffHours / 24);
    return {
      label: `${days} jour${days > 1 ? 's' : ''}`,
      status: 'normal'
    };
  }
}

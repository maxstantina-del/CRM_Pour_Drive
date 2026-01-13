import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../ui';
import { getSetting, setSetting } from '../../lib/db';

interface TourStep {
  target: string; // Sélecteur CSS de l'élément à mettre en surbrillance
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="sidebar"]',
    title: 'Bienvenue sur SimpleCRM ! 👋',
    description: 'Ce menu vous permet de naviguer entre les différentes vues: Dashboard, Pipeline, Liste complète, et Paramètres.',
    position: 'right'
  },
  {
    target: '[data-tour="add-lead"]',
    title: 'Créer un lead',
    description: 'Cliquez ici pour ajouter rapidement un nouveau lead. Vous pouvez ajouter le nom, l\'entreprise, le contact et bien plus.',
    position: 'bottom'
  },
  {
    target: '[data-tour="pipeline"]',
    title: 'Votre pipeline de vente',
    description: 'Visualisez tous vos leads organisés par étapes. Glissez-déposez les cartes pour les faire avancer dans le processus.',
    position: 'top'
  },
  {
    target: '[data-tour="search"]',
    title: 'Recherche rapide',
    description: 'Trouvez n\'importe quel lead en tapant son nom, son entreprise ou son email.',
    position: 'bottom'
  },
  {
    target: '[data-tour="export"]',
    title: 'Import / Export',
    description: 'Importez vos leads existants depuis un fichier CSV, ou exportez vos données pour les sauvegarder.',
    position: 'bottom'
  },
  {
    target: '[data-tour="settings"]',
    title: 'Paramètres',
    description: 'Configurez votre profil, activez l\'Ice Breaker AI (version payante), et gérez vos sauvegardes.',
    position: 'right'
  }
];

const STORAGE_KEY = 'crm_onboarding_completed';

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ isOpen, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState<DOMRect | null>(null);

  const currentTourStep = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (!isOpen) return;

    // Trouve l'élément cible et calcule sa position
    const updateTargetPosition = () => {
      const target = document.querySelector(currentTourStep.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetPosition(rect);

        // Scroll vers l'élément si nécessaire
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updateTargetPosition();

    // Recalcule la position si la fenêtre change de taille
    window.addEventListener('resize', updateTargetPosition);
    return () => window.removeEventListener('resize', updateTargetPosition);
  }, [currentStep, isOpen, currentTourStep.target]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    await setSetting(STORAGE_KEY, 'true');
    onComplete();
  };

  const handleSkip = async () => {
    await setSetting(STORAGE_KEY, 'true');
    onComplete();
  };

  if (!isOpen || !targetPosition) return null;

  // Calcule la position du tooltip selon la position demandée
  const getTooltipPosition = () => {
    const padding = 20;
    let top = 0;
    let left = 0;

    switch (currentTourStep.position) {
      case 'top':
        top = targetPosition.top - padding - 200; // 200px = hauteur approximative du tooltip
        left = targetPosition.left + targetPosition.width / 2;
        break;
      case 'bottom':
        top = targetPosition.bottom + padding;
        left = targetPosition.left + targetPosition.width / 2;
        break;
      case 'left':
        top = targetPosition.top + targetPosition.height / 2;
        left = targetPosition.left - padding - 400; // 400px = largeur tooltip
        break;
      case 'right':
        top = targetPosition.top + targetPosition.height / 2;
        left = targetPosition.right + padding;
        break;
    }

    return { top, left };
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <AnimatePresence>
      {/* Overlay semi-transparent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-[9999] backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Spotlight sur l'élément cible */}
      <div
        className="fixed z-[10000] pointer-events-none"
        style={{
          top: targetPosition.top - 4,
          left: targetPosition.left - 4,
          width: targetPosition.width + 8,
          height: targetPosition.height + 8,
          boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.7)',
          borderRadius: '8px',
          transition: 'all 0.3s ease'
        }}
      />

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[10001] w-[400px]"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: 'translate(-50%, 0)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass rounded-xl shadow-2xl border border-indigo-500/30 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {TOUR_STEPS.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentStep ? 'bg-indigo-400' : idx < currentStep ? 'bg-green-400' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {currentStep + 1} / {TOUR_STEPS.length}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white">{currentTourStep.title}</h3>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            {currentTourStep.description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-400"
            >
              Passer le tutoriel
            </Button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrevious}
                  className="gap-2"
                >
                  <ArrowLeft size={16} />
                  Précédent
                </Button>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="gap-2"
              >
                {isLastStep ? (
                  <>
                    <Check size={16} />
                    Terminer
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook pour gérer l'état du tutoriel d'onboarding
 */
export function useOnboarding() {
  const [showTour, setShowTour] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    async function loadData() {
      const completed = (await getSetting(STORAGE_KEY)) === 'true';
      setIsCompleted(completed);

      // Lance automatiquement le tour si pas encore complété
      if (!completed) {
        // Attend 1 seconde que les éléments se chargent
        setTimeout(() => setShowTour(true), 1000);
      }
    }
    loadData();
  }, []);

  const startTour = () => setShowTour(true);
  const resetTour = async () => {
    await setSetting(STORAGE_KEY, '');
    setIsCompleted(false);
    setShowTour(true);
  };

  return {
    showTour,
    isCompleted,
    startTour,
    resetTour,
    completeTour: () => {
      setShowTour(false);
      setIsCompleted(true);
    }
  };
}

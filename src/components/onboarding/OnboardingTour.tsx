/**
 * Onboarding tour component with hook
 */

import React, { useState, useEffect } from 'react';
import { Modal, ModalFooter, Button } from '../ui';
import { getItem, setItem, STORAGE_KEYS } from '../../lib/storage';
import { Rocket, Target, Layers, Calendar, Settings } from 'lucide-react';

/**
 * Hook to manage onboarding tour state
 */
export function useOnboarding() {
  const [shouldShowTour, setShouldShowTour] = useState(false);

  useEffect(() => {
    const completed = getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE, false);
    setShouldShowTour(!completed);
  }, []);

  const completeTour = () => {
    setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    setShouldShowTour(false);
  };

  return {
    shouldShowTour,
    completeTour
  };
}

export interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
}

const tourSteps = [
  {
    icon: <Rocket size={48} className="text-blue-500" />,
    title: 'Bienvenue dans Simple CRM ! 👋',
    description: 'Gérez vos leads et suivez votre pipeline de vente de manière simple et efficace.'
  },
  {
    icon: <Target size={48} className="text-green-500" />,
    title: 'Créez vos premiers leads',
    description: 'Cliquez sur "Nouveau Lead" pour ajouter vos prospects. Remplissez les informations et organisez-les par étape.'
  },
  {
    icon: <Layers size={48} className="text-purple-500" />,
    title: 'Vue Pipeline',
    description: 'Visualisez votre pipeline sous forme de tableau Kanban. Glissez-déposez les leads entre les étapes.'
  },
  {
    icon: <Calendar size={48} className="text-orange-500" />,
    title: 'Actions quotidiennes',
    description: 'La vue "Aujourd\'hui" vous montre toutes les actions à réaliser aujourd\'hui.'
  },
  {
    icon: <Settings size={48} className="text-gray-500 dark:text-gray-400" />,
    title: 'Import/Export',
    description: 'Importez vos leads depuis CSV ou Excel, et exportez vos données à tout moment.'
  }
];

export function OnboardingTour({ isOpen, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tourSteps[currentStep];

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} size="md" closeOnClickOutside={false}>
      <div className="text-center py-8">
        <div className="flex justify-center mb-6">
          {step.icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{step.title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">{step.description}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-blue-600 w-8'
                  : index < currentStep
                  ? 'bg-blue-400'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      <ModalFooter>
        {currentStep > 0 && (
          <Button variant="ghost" onClick={handlePrevious}>
            Précédent
          </Button>
        )}
        <div className="flex-1" />
        <Button variant="ghost" onClick={handleSkip}>
          Passer
        </Button>
        <Button variant="primary" onClick={handleNext}>
          {currentStep < tourSteps.length - 1 ? 'Suivant' : 'Commencer'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

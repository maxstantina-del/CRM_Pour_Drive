import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useLicense } from '../../hooks/useLicense';
import { Button } from '../ui';

interface TrialBannerProps {
  onActivateClick: () => void;
}

export function TrialBanner({ onActivateClick }: TrialBannerProps) {
  const { daysRemaining, isActivated, isTrialExpired } = useLicense();
  const [isDismissed, setIsDismissed] = useState(false);

  // Ne pas afficher si déjà activé
  if (isActivated || isDismissed) return null;

  const isUrgent = daysRemaining <= 3;
  const isCritical = daysRemaining === 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className={`fixed top-0 left-0 right-0 z-[100] ${
          isCritical
            ? 'bg-gradient-to-r from-red-600 to-red-700'
            : isUrgent
            ? 'bg-gradient-to-r from-orange-500 to-amber-600'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600'
        } shadow-xl`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {isCritical ? (
                <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                  <Clock size={20} className="text-white" />
                </div>
              ) : (
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles size={20} className="text-white" />
                </div>
              )}

              <div className="flex-1">
                <p className="text-white font-semibold text-sm sm:text-base">
                  {isCritical ? (
                    '⚠️ Période d\'essai expirée'
                  ) : (
                    <>
                      Version d'essai - {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
                    </>
                  )}
                </p>
                <p className="text-white/90 text-xs sm:text-sm">
                  {isCritical ? (
                    'Activez votre licence pour continuer à utiliser SimpleCRM'
                  ) : (
                    <>
                      Activez votre licence à <strong>39,99€</strong> pour un accès illimité à vie + Ice Breaker AI
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button
                onClick={onActivateClick}
                variant="secondary"
                size="sm"
                className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-lg whitespace-nowrap"
              >
                {isCritical ? 'Activer maintenant' : 'Acheter 39,99€'}
              </Button>

              {!isCritical && (
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  title="Masquer"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

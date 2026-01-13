import { useState } from 'react';
import { Modal, Button, Input } from '../ui';
import { useLicense } from '../../hooks/useLicense';
import { Check, AlertCircle, Copy, ExternalLink, CreditCard } from 'lucide-react';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LicenseActivationModal({ isOpen, onClose }: LicenseActivationModalProps) {
  const { activateLicense, generateLicenseKey } = useLicense();
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTestKey, setShowTestKey] = useState(false);

  const handleActivate = () => {
    setError(null);

    const result = activateLicense(licenseKey.toUpperCase());

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Recharge la page pour appliquer la licence
        window.location.reload();
      }, 2000);
    } else {
      setError(result.error || 'Erreur inconnue');
    }
  };

  const generateTestKey = () => {
    const testKey = generateLicenseKey();
    setLicenseKey(testKey);
    setShowTestKey(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activer votre licence" size="lg">
      {success ? (
        <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Licence activée !</h3>
          <p className="text-gray-400">
            Bienvenue dans SimpleCRM Premium. Profitez de toutes les fonctionnalités à vie.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bannière d'achat */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-lg">
                <CreditCard size={24} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">SimpleCRM Premium - 39,99€</h3>
                <ul className="space-y-1.5 text-sm text-gray-300 mb-4">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-400" />
                    Accès illimité à vie (aucun abonnement)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-400" />
                    Ice Breaker AI avec OpenAI
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-400" />
                    Mises à jour gratuites
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-400" />
                    Support par email
                  </li>
                </ul>

                {/* Bouton d'achat - À remplacer par votre système de paiement */}
                <a
                  href="https://your-payment-link.com" // TODO: Remplacer par lien Stripe/PayPal
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Acheter maintenant - 39,99€
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Formulaire d'activation */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vous avez déjà acheté ? Entrez votre clé de licence
              </label>
              <Input
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                maxLength={19}
                className="font-mono text-center text-lg tracking-wider"
              />
              <p className="text-xs text-gray-500 mt-2">
                La clé vous a été envoyée par email après l'achat
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-950/30 border border-red-500/30 rounded-lg text-red-300 text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {showTestKey && (
              <div className="flex items-start gap-3 p-4 bg-green-950/30 border border-green-500/30 rounded-lg text-green-300 text-sm">
                <Check size={16} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Clé de test générée</p>
                  <p className="text-xs text-gray-400">
                    Cette clé est valide et peut être utilisée pour tester le système
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={onClose} fullWidth>
                Annuler
              </Button>
              <Button onClick={handleActivate} fullWidth disabled={licenseKey.length < 19}>
                Activer la licence
              </Button>
            </div>
          </div>

          {/* Mode développeur - Génération de clé de test */}
          {process.env.NODE_ENV === 'development' && (
            <div className="pt-6 border-t border-white/10">
              <p className="text-xs text-gray-500 mb-3">Mode développement :</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateTestKey}
                className="gap-2"
              >
                <Copy size={14} />
                Générer une clé de test
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

import { useState, useEffect } from 'react';
import { getSetting, setSetting } from '../lib/db';

/**
 * Hook pour gérer le système de licence 14 jours d'essai
 *
 * FONCTIONNEMENT:
 * - À la première utilisation, stocke la date d'installation
 * - Calcule les jours restants
 * - Après 14 jours, marque comme expiré
 * - L'utilisateur peut activer une licence payante pour débloquer
 * - Une fois activé, le CRM est utilisable à vie
 */

interface LicenseData {
  installDate: string; // Date ISO de première installation
  licenseKey?: string; // Clé de licence si activée (format: XXXX-XXXX-XXXX-XXXX)
  isActivated: boolean; // Si la licence payante est activée
  activatedDate?: string; // Date d'activation
}

const STORAGE_KEY = 'crm_license';
const TRIAL_DAYS = 14;

export function useLicense() {
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Charge ou initialise les données de licence
      const stored = await getSetting(STORAGE_KEY);

      if (stored) {
        try {
          const data: LicenseData = JSON.parse(stored);
          setLicenseData(data);
        } catch (e) {
          console.error('Error parsing license data:', e);
          await initializeTrial();
        }
      } else {
        await initializeTrial();
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const initializeTrial = async () => {
    const newLicense: LicenseData = {
      installDate: new Date().toISOString(),
      isActivated: false,
    };
    await setSetting(STORAGE_KEY, JSON.stringify(newLicense));
    setLicenseData(newLicense);
  };

  const calculateDaysRemaining = (): number => {
    if (!licenseData || licenseData.isActivated) return -1; // -1 = illimité

    const installDate = new Date(licenseData.installDate);
    const now = new Date();
    const diffMs = now.getTime() - installDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, TRIAL_DAYS - diffDays);
  };

  const isTrialExpired = (): boolean => {
    if (!licenseData) return false;
    if (licenseData.isActivated) return false; // Licence activée = jamais expiré

    const daysRemaining = calculateDaysRemaining();
    return daysRemaining === 0;
  };

  const activateLicense = async (licenseKey: string): Promise<{ success: boolean; error?: string }> => {
    // Validation simple de la clé (format XXXX-XXXX-XXXX-XXXX)
    const keyRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

    if (!keyRegex.test(licenseKey)) {
      return {
        success: false,
        error: 'Format de clé invalide. Format attendu: XXXX-XXXX-XXXX-XXXX'
      };
    }

    // Validation de la clé (algorithme simple pour v1)
    // TODO: Dans une vraie app, vérifier via API backend
    if (!isValidLicenseKey(licenseKey)) {
      return {
        success: false,
        error: 'Clé de licence invalide ou déjà utilisée'
      };
    }

    // Active la licence
    const updatedLicense: LicenseData = {
      ...licenseData!,
      licenseKey,
      isActivated: true,
      activatedDate: new Date().toISOString(),
    };

    await setSetting(STORAGE_KEY, JSON.stringify(updatedLicense));
    setLicenseData(updatedLicense);

    return { success: true };
  };

  // Fonction de validation de clé (algorithme simple)
  const isValidLicenseKey = (key: string): boolean => {
    // Algorithme de validation simple basé sur un checksum
    // Format: AAAA-BBBB-CCCC-DDDD
    // Les 3 premiers blocs sont aléatoires, le dernier est un checksum

    const parts = key.split('-');
    if (parts.length !== 4) return false;

    const [a, b, c, checksum] = parts;

    // Calcul du checksum attendu
    const expectedChecksum = calculateChecksum(a + b + c);

    return checksum === expectedChecksum;
  };

  const calculateChecksum = (input: string): string => {
    // Checksum simple basé sur la somme des codes ASCII
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      sum += input.charCodeAt(i);
    }

    // Convertit en base 36 et prend 4 caractères
    return sum.toString(36).toUpperCase().padStart(4, '0').slice(-4);
  };

  // Fonction pour générer une clé de licence (pour tests ou admin)
  const generateLicenseKey = (): string => {
    const randomBlock = () => {
      return Math.random().toString(36).substring(2, 6).toUpperCase();
    };

    const a = randomBlock();
    const b = randomBlock();
    const c = randomBlock();
    const checksum = calculateChecksum(a + b + c);

    return `${a}-${b}-${c}-${checksum}`;
  };

  return {
    loading,
    licenseData,
    daysRemaining: calculateDaysRemaining(),
    isTrialExpired: isTrialExpired(),
    isActivated: licenseData?.isActivated || false,
    activateLicense,
    generateLicenseKey, // Pour tests uniquement
  };
}

/**
 * Hook pour vérifier si une fonctionnalité est disponible selon la licence
 */
export function useFeatureAccess(featureName: 'icebreaker' | 'email' | 'backup') {
  const { isActivated } = useLicense();

  // Ice Breaker disponible uniquement en version payante
  if (featureName === 'icebreaker') {
    return { hasAccess: isActivated, reason: !isActivated ? 'Fonctionnalité disponible en version complète' : undefined };
  }

  // Email et backup disponibles même en trial
  return { hasAccess: true };
}

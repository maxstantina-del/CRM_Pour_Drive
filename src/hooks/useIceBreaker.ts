import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile';
import { generateIceBreaker as generateWithOpenAI, testOpenAIKey } from '../services/openaiService';
import { Lead } from '../lib/types';
import { getSetting, setSetting } from '../lib/db';

export interface IceBreakerSettings {
    enabled: boolean;
    apiKey: string;
    tone: 'professional' | 'casual' | 'enthusiastic';
    customPrompt: string;
}

const DEFAULT_SETTINGS: IceBreakerSettings = {
    enabled: false,
    apiKey: '',
    tone: 'professional',
    customPrompt: 'Mentionne un élément concret de leur entreprise ou site web pour personnaliser l\'approche.'
};

const STORAGE_KEY = 'crm_icebreaker_settings';

export function useIceBreaker() {
    const [settings, setSettings] = useState<IceBreakerSettings>(DEFAULT_SETTINGS);
    const { profile } = useUserProfile();

    useEffect(() => {
        async function loadData() {
            const stored = await getSetting(STORAGE_KEY);
            if (stored) {
                try {
                    setSettings(JSON.parse(stored));
                } catch (e) {
                    setSettings(DEFAULT_SETTINGS);
                }
            }
        }
        loadData();
    }, []);

    const updateSettings = async (newSettings: IceBreakerSettings) => {
        setSettings(newSettings);
        await setSetting(STORAGE_KEY, JSON.stringify(newSettings));
    };

    const testApiKey = async (apiKey: string) => {
        return await testOpenAIKey(apiKey);
    };

    const generateIceBreaker = async (lead: Lead): Promise<{ success: boolean; text?: string; error?: string }> => {
        if (!settings.enabled) {
            return {
                success: false,
                error: 'Ice Breaker désactivé. Activez-le dans les paramètres.'
            };
        }

        if (!settings.apiKey || settings.apiKey.trim() === '') {
            return {
                success: false,
                error: 'Clé API OpenAI manquante. Configurez-la dans les paramètres.'
            };
        }

        // Appel au service OpenAI
        const result = await generateWithOpenAI(settings.apiKey, {
            leadName: lead.name,
            leadCompany: lead.company,
            leadRole: lead.jobTitle,
            leadWebsite: lead.website,
            leadLinkedIn: lead.linkedin,
            userSector: profile.sector,
            userRole: profile.role,
            tone: settings.tone,
            customPrompt: settings.customPrompt
        });

        if (result.success) {
            return {
                success: true,
                text: result.text
            };
        } else {
            return {
                success: false,
                error: result.error
            };
        }
    };

    return {
        settings,
        updateSettings,
        generateIceBreaker,
        testApiKey
    };
}

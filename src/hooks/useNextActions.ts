import { useState, useEffect } from 'react';
import { getSetting, setSetting } from '../lib/db';

const STORAGE_KEY = 'crm_custom_next_actions_v2'; // Changed key to ensure fresh start

export const DEFAULT_ACTIONS = [
    'Appel',
    'Email',
    'Rendez-vous',
    'Déjeuner',
    'Relance',
    'Envoyer devis',
    'Signer contrat'
];

export function useNextActions() {
    const [customActions, setCustomActions] = useState<string[]>([]);

    useEffect(() => {
        async function loadData() {
            const stored = await getSetting(STORAGE_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        setCustomActions(parsed);
                    }
                } catch (e) {
                    console.error('Failed to parse custom actions', e);
                }
            }
        }
        loadData();
    }, []);

    const addAction = async (label: string) => {
        const trimmed = label.trim();
        if (!trimmed) return;

        // Check against both defaults and custom
        if (DEFAULT_ACTIONS.includes(trimmed) || customActions.includes(trimmed)) return;

        const newActions = [...customActions, trimmed];
        setCustomActions(newActions);
        await setSetting(STORAGE_KEY, JSON.stringify(newActions));
    };

    const removeAction = async (label: string) => {
        // Only remove from custom actions
        const newActions = customActions.filter(a => a !== label);
        setCustomActions(newActions);
        await setSetting(STORAGE_KEY, JSON.stringify(newActions));
    };

    const isDefaultAction = (label: string) => DEFAULT_ACTIONS.includes(label);

    return {
        actions: [...DEFAULT_ACTIONS, ...customActions],
        addAction,
        removeAction,
        isDefaultAction
    };
}

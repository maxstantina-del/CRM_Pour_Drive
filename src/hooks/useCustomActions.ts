import { useState, useEffect } from 'react';
import { CustomAction } from '../lib/types';
import { getSetting, setSetting } from '../lib/db';

const STORAGE_KEY = 'crm_custom_actions';

// Default actions
export const DEFAULT_ACTIONS = [
  { id: 'call', label: '📞 Appeler' },
  { id: 'email', label: '✉️ Email' },
  { id: 'meeting', label: '🤝 RDV' },
  { id: 'proposal', label: '📄 Proposition' },
  { id: 'followup', label: '🔄 Relancer' },
];

export function useCustomActions() {
  const [customActions, setCustomActions] = useState<CustomAction[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const stored = await getSetting(STORAGE_KEY);
        if (stored) {
          setCustomActions(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading custom actions:', error);
      }
    }
    loadData();
  }, []);

  const saveCustomActions = async (actions: CustomAction[]) => {
    await setSetting(STORAGE_KEY, JSON.stringify(actions));
    setCustomActions(actions);
  };

  const addCustomAction = async (label: string) => {
    const newAction: CustomAction = {
      id: `custom-${Date.now()}`,
      label,
    };

    const updated = [...customActions, newAction];
    await saveCustomActions(updated);
    return newAction;
  };

  const deleteCustomAction = async (id: string) => {
    const updated = customActions.filter(a => a.id !== id);
    await saveCustomActions(updated);
  };

  const getAllActions = () => {
    return [...DEFAULT_ACTIONS, ...customActions];
  };

  const isCustomAction = (id: string) => {
    return id.startsWith('custom-');
  };

  return {
    customActions,
    allActions: getAllActions(),
    addCustomAction,
    deleteCustomAction,
    isCustomAction,
  };
}

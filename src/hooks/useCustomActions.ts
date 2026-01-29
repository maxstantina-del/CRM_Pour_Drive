/**
 * Custom actions hook
 * Allows defining custom actions that can be performed on leads
 */

import { useState, useEffect } from 'react';
import type { CustomAction, Lead } from '../lib/types';
import { getItem, setItem, STORAGE_KEYS } from '../lib/storage';

/**
 * Default custom actions
 */
const DEFAULT_ACTIONS: CustomAction[] = [];

/**
 * Hook to manage custom actions for leads
 */
export function useCustomActions() {
  const [actions, setActions] = useState<CustomAction[]>(() => {
    return getItem<CustomAction[]>(STORAGE_KEYS.CUSTOM_ACTIONS, DEFAULT_ACTIONS);
  });

  // Persist to localStorage
  useEffect(() => {
    setItem(STORAGE_KEYS.CUSTOM_ACTIONS, actions);
  }, [actions]);

  /**
   * Add a custom action
   */
  const addAction = (action: CustomAction) => {
    setActions(prev => [...prev, action]);
  };

  /**
   * Remove a custom action
   */
  const removeAction = (actionId: string) => {
    setActions(prev => prev.filter(a => a.id !== actionId));
  };

  /**
   * Update a custom action
   */
  const updateAction = (actionId: string, updates: Partial<CustomAction>) => {
    setActions(prev =>
      prev.map(action =>
        action.id === actionId ? { ...action, ...updates } : action
      )
    );
  };

  /**
   * Execute a custom action on a lead
   */
  const executeAction = async (actionId: string, lead: Lead) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) {
      console.error(`Action not found: ${actionId}`);
      return;
    }

    try {
      await action.handler(lead);
    } catch (error) {
      console.error(`Error executing action ${actionId}:`, error);
      throw error;
    }
  };

  return {
    actions,
    addAction,
    removeAction,
    updateAction,
    executeAction
  };
}

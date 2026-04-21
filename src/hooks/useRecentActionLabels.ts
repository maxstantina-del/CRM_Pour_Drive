/**
 * Remembers the last N distinct action labels the user typed,
 * so they don't have to retype common labels like "Relancer", "Rappeler", etc.
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'crm_recent_action_labels';
const MAX_LABELS = 10;
const DEFAULT_LABELS = ['Relancer', 'Rappeler le gérant', 'Envoyer email', 'Relance devis', 'Prendre RDV'];

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LABELS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
      return parsed.length ? parsed : DEFAULT_LABELS;
    }
    return DEFAULT_LABELS;
  } catch {
    return DEFAULT_LABELS;
  }
}

export function useRecentActionLabels() {
  const [labels, setLabels] = useState<string[]>(() => loadFromStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
    } catch {
      /* quota */
    }
  }, [labels]);

  const addLabel = useCallback((raw: string) => {
    const label = raw.trim();
    if (!label) return;
    setLabels((prev) => {
      const deduped = [label, ...prev.filter((l) => l.toLowerCase() !== label.toLowerCase())];
      return deduped.slice(0, MAX_LABELS);
    });
  }, []);

  const removeLabel = useCallback((raw: string) => {
    const label = raw.trim().toLowerCase();
    setLabels((prev) => prev.filter((l) => l.toLowerCase() !== label));
  }, []);

  const defaultLabel = labels[0] ?? 'Relancer';

  return { labels, addLabel, removeLabel, defaultLabel };
}

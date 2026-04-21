/**
 * Detect an Ollama instance and expose a chat helper.
 *
 * Priority:
 *   1. VITE_OLLAMA_URL (e.g. https://ollama.chosen-mx.com via Cloudflare Tunnel) — works on HTTPS prod.
 *   2. http://localhost:11434 — works in local dev only.
 *
 * Ollama must be started with CORS allowed for the app origin:
 *   setx OLLAMA_ORIGINS "https://crm-pour-drive.vercel.app,https://ollama.chosen-mx.com,http://localhost:5173"
 *   (then restart Ollama)
 */

import { useCallback, useEffect, useState } from 'react';

const OLLAMA_URL = (import.meta.env.VITE_OLLAMA_URL as string | undefined)?.replace(/\/+$/, '') || 'http://localhost:11434';
const PREFERRED_MODELS = ['llama3.2:3b', 'llama3.2', 'mistral', 'llama3', 'phi3'];

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaStatus {
  available: boolean;
  model: string | null;
  checking: boolean;
}

async function probe(): Promise<{ available: boolean; model: string | null }> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { method: 'GET' });
    if (!res.ok) return { available: false, model: null };
    const data = (await res.json()) as { models: Array<{ name: string }> };
    const names = (data.models ?? []).map(m => m.name);
    const preferred = PREFERRED_MODELS.find(p => names.some(n => n.startsWith(p)));
    const fallback = names[0];
    return { available: true, model: preferred ?? fallback ?? null };
  } catch {
    return { available: false, model: null };
  }
}

export function useOllama() {
  const [status, setStatus] = useState<OllamaStatus>({ available: false, model: null, checking: true });

  const refresh = useCallback(async () => {
    setStatus(s => ({ ...s, checking: true }));
    const r = await probe();
    setStatus({ available: r.available, model: r.model, checking: false });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const chat = useCallback(
    async (messages: OllamaMessage[], signal?: AbortSignal): Promise<string> => {
      if (!status.model) throw new Error('No Ollama model available');
      const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: status.model,
          messages,
          stream: false,
          options: { temperature: 0.4, num_predict: 500 },
        }),
        signal,
      });
      if (!res.ok) throw new Error(`Ollama error ${res.status}`);
      const data = (await res.json()) as { message: { content: string } };
      return data.message.content;
    },
    [status.model]
  );

  return { status, refresh, chat };
}

export function buildSystemPrompt(leads: Array<{ name: string; stage: string; value?: number; city?: string; company?: string }>): string {
  const summary = leads.length === 0
    ? 'Aucun lead pour le moment.'
    : `${leads.length} leads actifs (par étape : ${countByStage(leads)}).`;
  const top = leads
    .filter(l => (l.value ?? 0) > 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .slice(0, 5)
    .map(l => `- ${l.name}${l.company ? ` (${l.company})` : ''}${l.city ? `, ${l.city}` : ''} — ${l.stage} — ${l.value}€`)
    .join('\n');

  return [
    "Tu es l'assistant CRM de Max Stantina, entrepreneur français qui prospecte pour Autoglass (pare-brise B2B) et le secteur CBD.",
    'Contexte actuel :',
    summary,
    top ? `Top 5 par valeur :\n${top}` : '',
    '',
    "Règles :",
    "- Réponds toujours en français, concis (max 4 phrases sauf demande explicite).",
    "- Pour rédiger un email, fournis uniquement le corps du message, prêt à copier.",
    "- Si on te demande des stats précises, renvoie vers la commande `stats` du CRM.",
    "- Tu ne peux pas exécuter d'action ni modifier la base — tu donnes des conseils, scores, emails, relances.",
  ].filter(Boolean).join('\n');
}

function countByStage(leads: Array<{ stage: string }>): string {
  const map: Record<string, number> = {};
  for (const l of leads) map[l.stage] = (map[l.stage] ?? 0) + 1;
  return Object.entries(map).map(([k, v]) => `${k}=${v}`).join(', ');
}

/**
 * Chat with Cloudflare Workers AI via the /api/chat Vercel Function.
 * No secrets on the client — the token stays server-side.
 */

import { useCallback, useEffect, useState } from 'react';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIStatus {
  available: boolean;
  checking: boolean;
  model: string | null;
}

const ENDPOINT = '/api/chat';

export function useAI() {
  const [status, setStatus] = useState<AIStatus>({ available: false, checking: true, model: null });

  const probe = useCallback(async () => {
    setStatus(s => ({ ...s, checking: true }));
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'ping' }] }),
      });
      if (!res.ok) {
        setStatus({ available: false, checking: false, model: null });
        return;
      }
      const data = (await res.json()) as { reply?: string; model?: string };
      setStatus({ available: !!data.reply, checking: false, model: data.model ?? null });
    } catch {
      setStatus({ available: false, checking: false, model: null });
    }
  }, []);

  useEffect(() => {
    probe();
  }, [probe]);

  const chat = useCallback(async (messages: AIMessage[], signal?: AbortSignal): Promise<string> => {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI error ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = (await res.json()) as { reply: string };
    return data.reply;
  }, []);

  return { status, chat, refresh: probe };
}

export function buildSystemPrompt(
  leads: Array<{ name: string; stage: string; value?: number; city?: string; company?: string }>
): string {
  const total = leads.length;
  const byStage: Record<string, number> = {};
  for (const l of leads) byStage[l.stage] = (byStage[l.stage] ?? 0) + 1;
  const stageSummary = Object.entries(byStage).map(([k, v]) => `${k}=${v}`).join(', ') || 'aucun';
  const top = leads
    .filter(l => (l.value ?? 0) > 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .slice(0, 5)
    .map(l => `- ${l.name}${l.company ? ` (${l.company})` : ''}${l.city ? `, ${l.city}` : ''} — ${l.stage} — ${l.value}€`)
    .join('\n');

  return [
    "Tu es l'assistant CRM de Max Stantina, entrepreneur français qui prospecte pour Autoglass (pare-brise B2B) et le secteur CBD.",
    'Contexte actuel :',
    `${total} leads (par étape : ${stageSummary}).`,
    top ? `Top 5 par valeur :\n${top}` : '',
    '',
    "Règles :",
    '- Réponds en français, concis (max 4 phrases sauf demande explicite).',
    "- Pour un email, donne juste le corps, prêt à copier.",
    "- Pour des stats précises, suggère la commande `stats` du CRM.",
    '- Tu ne peux pas modifier la base : tu donnes conseils, scores, emails, relances.',
  ].filter(Boolean).join('\n');
}

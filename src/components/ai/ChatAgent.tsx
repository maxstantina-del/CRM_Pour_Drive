/**
 * CRM chat assistant.
 * Uses Cloudflare Workers AI via /api/chat (token stays server-side) —
 * falls back to the rule-based command engine (see chatCommands.ts) otherwise.
 * Exact commands (stats, top, cherche…) always short-circuit the LLM for speed.
 */

import { useState, useRef, useEffect } from 'react';
import type { Lead } from '../../lib/types';
import { Send, Bot, X, Maximize2, Minimize2, Trash2, Loader2, Zap, CircleDot } from 'lucide-react';
import { handle, parseIntent } from './chatCommands';
import { useAI, buildSystemPrompt, type AIMessage } from '../../hooks/useAI';

export interface ChatAgentProps {
  leads: Lead[];
  onCreateLead: (leadData: Partial<Lead>) => void;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  /**
   * Masque le bouton flottant (et ferme la chat si ouvert) quand un
   * drawer/modal couvre la zone de droite — évite le chevauchement
   * avec le footer du LeadDrawer.
   */
  hidden?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source?: 'rules' | 'ai';
}

const GREETING =
  'Bonjour ! Parle-moi en langage naturel ou utilise les commandes (stats, top 5, cherche…). Tape "aide" pour la liste.';

export function ChatAgent({ leads, hidden }: ChatAgentProps) {
  const { status: ai, chat: aiChat, refresh: refreshAI } = useAI();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: GREETING, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const pushMsg = (msg: Omit<Message, 'id' | 'timestamp'> & Partial<Pick<Message, 'id' | 'timestamp'>>) => {
    setMessages(prev => [
      ...prev,
      {
        id: msg.id ?? String(Date.now() + Math.random()),
        timestamp: msg.timestamp ?? new Date(),
        ...msg,
      } as Message,
    ]);
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;

    pushMsg({ role: 'user', content: text });
    setInput('');

    const intent = parseIntent(text);

    // Commands always handled locally (fast, deterministic).
    if (intent.kind !== 'unknown') {
      pushMsg({ role: 'assistant', content: handle(text, leads), source: 'rules' });
      return;
    }

    // Free-form question → Workers AI, fall back to rules if unavailable.
    if (!ai.available) {
      pushMsg({
        role: 'assistant',
        content:
          "L'IA n'est pas disponible pour le moment. Tape \"aide\" pour voir les commandes.",
        source: 'rules',
      });
      return;
    }

    setThinking(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const history: AIMessage[] = [
        { role: 'system', content: buildSystemPrompt(leads) },
        ...messages
          .slice(-12) // keep last 12 turns for context
          .filter(m => m.role !== 'assistant' || m.id !== '1') // drop greeting
          .map(m => ({ role: m.role, content: m.content } as AIMessage)),
        { role: 'user', content: text },
      ];
      const reply = await aiChat(history, ctrl.signal);
      pushMsg({ role: 'assistant', content: reply, source: 'ai' });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      pushMsg({
        role: 'assistant',
        content: `Erreur IA : ${(err as Error).message}. Essaye une commande (aide).`,
        source: 'rules',
      });
    } finally {
      setThinking(false);
      abortRef.current = null;
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([{ id: '1', role: 'assistant', content: GREETING, timestamp: new Date() }]);
  };

  // Drawer/modal ouvert → on n'affiche rien (ni le FAB, ni le panneau ouvert).
  // Le chat se rouvre de lui-même quand le drawer se ferme.
  if (hidden) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          refreshAI();
        }}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-40"
        title="Assistant CRM"
      >
        <Bot size={24} />
      </button>
    );
  }

  const containerClass = isExpanded
    ? 'fixed inset-4 z-40 flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800'
    : 'fixed bottom-6 right-6 z-40 flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 w-[420px] h-[580px]';

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="text-blue-600 dark:text-blue-400" size={20} />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Assistant CRM</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{leads.length} leads</span>
          {ai.checking ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Loader2 className="w-2.5 h-2.5 animate-spin" /> check
            </span>
          ) : ai.available ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 flex items-center gap-1" title={ai.model ?? 'Workers AI'}>
              <CircleDot className="w-2.5 h-2.5" /> IA
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1" title="IA indisponible — mode commandes">
              <Zap className="w-2.5 h-2.5" /> Commandes
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearChat} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400" title="Effacer">
            <Trash2 size={14} />
          </button>
          <button onClick={() => setIsExpanded(v => !v)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
            <X size={16} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 dark:bg-gray-950">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              }`}
            >
              <pre className="text-sm whitespace-pre-wrap font-sans m-0">{m.content}</pre>
              <p className="text-[10px] mt-1 opacity-60 flex items-center gap-1">
                {m.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                {m.source === 'ai' && <span>· 🤖</span>}
              </p>
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-500 dark:text-gray-300 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              réflexion…
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-900 rounded-b-lg">
        <div className="flex gap-1 mb-2 flex-wrap">
          {['stats', 'top 5', 'relancer 7', 'aide'].map(cmd => (
            <button
              key={cmd}
              onClick={() => send(cmd)}
              disabled={thinking}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 rounded text-gray-700 dark:text-gray-200"
            >
              {cmd}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={ai.available ? 'Pose ta question…' : 'stats, top 5, cherche Annecy…'}
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            disabled={thinking}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || thinking}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded"
            title="Envoyer"
          >
            {thinking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Local CRM chat assistant.
 * Rule-based command engine — zero API cost. See chatCommands.ts.
 */

import { useState, useRef, useEffect } from 'react';
import type { Lead } from '../../lib/types';
import { Card, Button, Input } from '../ui';
import { Send, Bot, X, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { handle } from './chatCommands';

export interface ChatAgentProps {
  leads: Lead[];
  onCreateLead: (leadData: Partial<Lead>) => void;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const GREETING =
  'Bonjour ! Tape "aide" pour voir ce que je peux faire (stats, top, relancer, cherche…).';

export function ChatAgent({ leads }: ChatAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: GREETING, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const now = Date.now();
    const userMsg: Message = { id: String(now), role: 'user', content: text, timestamp: new Date() };
    const reply: Message = {
      id: String(now + 1),
      role: 'assistant',
      content: handle(text, leads),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg, reply]);
    setInput('');
  };

  const handleSend = () => send(input);

  const clearChat = () => {
    setMessages([{ id: '1', role: 'assistant', content: GREETING, timestamp: new Date() }]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-40"
        title="Assistant CRM"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed ${isExpanded ? 'inset-4' : 'bottom-6 right-6 w-[400px] max-h-[600px]'} z-40`}
      >
        <Card className="flex flex-col h-full shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900">Assistant CRM</h3>
              <span className="text-xs text-gray-500">{leads.length} leads</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat} className="p-2 rounded hover:bg-gray-100" title="Effacer">
                <Trash2 size={14} />
              </button>
              <button onClick={() => setIsExpanded(v => !v)} className="p-2 rounded hover:bg-gray-100">
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 200 }}>
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <pre className="text-sm whitespace-pre-wrap font-sans">{m.content}</pre>
                  <p className="text-[10px] mt-1 opacity-60">
                    {m.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t">
            <div className="flex gap-2 mb-2 flex-wrap">
              {['stats', 'top 5', 'relancer 7', 'aide'].map(cmd => (
                <button
                  key={cmd}
                  onClick={() => send(cmd)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  {cmd}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="stats, top 5, cherche Annecy…"
                fullWidth
              />
              <Button variant="primary" icon={<Send size={16} />} onClick={handleSend} disabled={!input.trim()} />
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

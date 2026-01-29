/**
 * AI Chat Agent for lead management
 */

import React, { useState } from 'react';
import type { Lead } from '../../lib/types';
import { Card, Button, Input } from '../ui';
import { Send, Bot, X, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export function ChatAgent({ leads, onCreateLead, onUpdateLead }: ChatAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant CRM. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simple response logic (in production, this would call the Pica AI API)
    setTimeout(() => {
      const response = generateResponse(input, leads);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);
  };

  const generateResponse = (query: string, leads: Lead[]): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('combien') && lowerQuery.includes('lead')) {
      return `Vous avez actuellement ${leads.length} leads dans votre pipeline.`;
    }
    if (lowerQuery.includes('stat')) {
      const won = leads.filter(l => l.stage === 'won').length;
      const lost = leads.filter(l => l.stage === 'lost').length;
      return `Statistiques: ${leads.length} leads au total, ${won} gagnés, ${lost} perdus.`;
    }
    if (lowerQuery.includes('créer') || lowerQuery.includes('nouveau')) {
      return 'Pour créer un nouveau lead, cliquez sur le bouton "Nouveau Lead" en haut de la page.';
    }

    return 'Je suis là pour vous aider avec votre CRM. Vous pouvez me poser des questions sur vos leads, les statistiques, ou comment utiliser l\'application.';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-40"
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
        className={`fixed ${isExpanded ? 'inset-4' : 'bottom-6 right-6 w-96'} z-40`}
      >
        <Card className="flex flex-col h-full shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900">Assistant CRM</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded hover:bg-gray-100"
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question..."
                fullWidth
              />
              <Button
                variant="primary"
                icon={<Send size={16} />}
                onClick={handleSend}
                disabled={!input.trim()}
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

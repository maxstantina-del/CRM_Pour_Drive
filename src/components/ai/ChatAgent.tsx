import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { generateAIResponse } from '../../utils/aiResponseGenerator';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Bonjour! 👋 Je suis votre assistant CRM intelligent. Je connais parfaitement le CRM Bolt et je suis là pour vous aider à gérer vos leads efficacement.\n\nVous pouvez me demander:\n• Comment utiliser une fonctionnalité\n• Des conseils pour optimiser vos ventes\n• De l'aide pour résoudre un problème\n• Des informations sur les statistiques\n\nComment puis-je vous aider?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const userInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Générer une réponse intelligente basée sur la base de connaissances du CRM
      const response = await generateAIResponse(userInput);

      // Simuler un délai de réponse pour rendre l'expérience plus naturelle
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 500 + Math.random() * 1000);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre question?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 glass hover:bg-white/10 text-gray-100 rounded-full p-4 shadow-2xl transition-all duration-200 hover:scale-110 z-50 group"
        aria-label="Ouvrir le chat IA"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <MessageCircle size={24} />
          <Sparkles
            size={12}
            className="absolute -top-1 -right-1 text-accent-blue animate-pulse"
          />
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed bottom-6 right-6 w-96 h-[600px] glass rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="glass border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <Sparkles
              size={12}
              className="absolute -top-0.5 -right-0.5 text-accent-blue animate-pulse"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-100 flex items-center gap-1">
              Assistant CRM Intelligent
            </h3>
            <p className="text-xs text-gray-400">Expert du CRM Bolt · Propulsé par Pica</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/10 rounded-lg p-2 transition-colors text-gray-400 hover:text-gray-100"
          aria-label="Fermer le chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-800/50">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-accent-blue text-white'
                    : 'bg-gradient-to-br from-accent-purple to-accent-blue text-white'
                }`}
              >
                {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`max-w-[75%] rounded-xl p-3 ${
                  message.role === 'user'
                    ? 'bg-accent-blue text-white'
                    : 'glass text-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <span className={`text-xs mt-2 block ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue text-white flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="glass rounded-xl p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-accent-purple rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez une question sur vos leads..."
            className="flex-1 glass rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent text-gray-100 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-accent-blue hover:bg-accent-blue/80 disabled:bg-white/5 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 transition-all hover:scale-105 disabled:hover:scale-100"
            aria-label="Envoyer le message"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Appuyez sur Entrée pour envoyer
        </p>
      </div>
    </motion.div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Image as ImageIcon, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export default function Agent() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('botWelcome'),
      sender: 'bot',
      timestamp: '10:00 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "That's an interesting question. Based on common agricultural practices, I recommend checking the soil moisture and ensuring proper sunlight. Would you like me to analyze a photo of your crop?",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="pt-28 pb-24 md:pb-12 h-[100vh] max-w-5xl mx-auto px-8 flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-t-[3rem] border-b border-divider flex items-center justify-between shadow-soft z-10"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-deep-green rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{t('agentTitle')}</h2>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-accent-green rounded-full animate-pulse shadow-[0_0_10px_rgba(163,199,109,0.8)]" />
              <span className="text-xs text-deep-green font-black uppercase tracking-widest">{t('online')}</span>
            </div>
          </div>
        </div>
        <button className="neumorphic-btn !p-3 text-deep-green">
          <Sparkles className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 bg-surface-alt/50 border-x border-divider scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-soft ${
                  msg.sender === 'user' ? 'bg-bg-nature text-deep-green' : 'bg-deep-green text-white'
                }`}>
                  {msg.sender === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                </div>
                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-5 rounded-[2rem] shadow-soft text-lg leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-deep-green text-white rounded-tr-none' 
                      : 'bg-white text-text-primary rounded-tl-none border border-divider'
                  }`}>
                    <p>{msg.text}</p>
                  </div>
                  <span className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${msg.sender === 'user' ? 'text-deep-green/60' : 'text-text-secondary/60'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-b-[3rem] border-t border-divider shadow-2xl z-10"
      >
        <div className="flex items-center gap-4 bg-bg-nature p-3 rounded-[2rem] border border-divider shadow-inner">
          <button className="p-3 text-deep-green hover:bg-white rounded-full transition-all shadow-soft active:scale-90">
            <Paperclip className="w-6 h-6" />
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('askAnything')}
            className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-2 px-4 text-text-primary placeholder:text-text-secondary/40"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-4 bg-deep-green text-white rounded-full hover:bg-muted-green transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-90"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

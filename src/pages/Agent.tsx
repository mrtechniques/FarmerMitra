import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Leaf, X, Sprout, Bug, Droplets, Sun, Copy, Check, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { ScanResult } from '../types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  isLoading?: boolean;
}

interface AgentProps {
  initialContext?: ScanResult | null;
  onClearContext?: () => void;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-2.0-flash';

const QUICK_PROMPTS = [
  { icon: Bug, label: 'diagPlant', text: 'diagPlantQuery' },
  { icon: Droplets, label: 'waterTips', text: 'waterTipsQuery' },
  { icon: Sprout, label: 'soilHealth', text: 'soilHealthQuery' },
  { icon: Sun, label: 'bestPractices', text: 'bestPracticesQuery' },
];

async function callGemini(
  messages: { role: string; parts: { text: string }[] }[],
  systemPrompt: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file to enable AI responses.";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: messages,
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not get a response.';
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="transition-opacity p-1.5 rounded-lg hover:bg-black/5 text-text-secondary"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function SpeakButton({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const handlePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };
  return (
    <button
      onClick={handlePlay}
      className={`transition-opacity p-1.5 rounded-lg hover:bg-black/5 ${isPlaying ? 'text-accent-green' : 'text-text-secondary'}`}
      title={isPlaying ? "Stop Speaking" : "Read Aloud"}
    >
      <Volume2 className="w-3.5 h-3.5" />
    </button>
  );
}

export default function Agent({ initialContext, onClearContext }: AgentProps) {
  const { t } = useLanguage();

  const systemPrompt = `You are FarmerMitra's AI agricultural assistant. You help farmers identify and treat plant diseases, provide farming advice, and explain agricultural concepts in simple, practical terms.

${initialContext ? `The farmer just scanned a plant and got this result:
- Plant: ${initialContext.leafType}
- Disease: ${initialContext.disease}
- Confidence: ${initialContext.confidence}%
- Details: ${initialContext.details}
- Recommended Remedies: ${initialContext.remedies.join('; ')}
Start by acknowledging this diagnosis and offering to help with follow-up questions.` : 'Greet the farmer warmly and offer to help with plant diseases or farming advice.'}

Keep responses concise (2-4 sentences), friendly, and practical. Use simple language suitable for farmers. Do not use markdown formatting like ** or #.`;

  const welcomeText = initialContext
    ? `I can see your ${initialContext.leafType} was diagnosed with ${initialContext.disease} (${initialContext.confidence}% confidence). I'm here to help! What would you like to know about treatment or prevention?`
    : t('botWelcome');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: welcomeText,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationRef = useRef<{ role: string; parts: { text: string }[] }[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Voice input is not supported in this browser.");
      }
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setShowQuickPrompts(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const loadingId = (Date.now() + 1).toString();
    const loadingMsg: Message = {
      id: loadingId,
      text: '',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsLoading(true);

    conversationRef.current.push({ role: 'user', parts: [{ text: trimmed }] });

    try {
      const reply = await callGemini(conversationRef.current, systemPrompt);
      conversationRef.current.push({ role: 'model', parts: [{ text: reply }] });
      setMessages(prev =>
        prev.map(m => (m.id === loadingId ? { ...m, text: reply, isLoading: false } : m))
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong.';
      setMessages(prev =>
        prev.map(m => (m.id === loadingId ? { ...m, text: `Error: ${errMsg}`, isLoading: false } : m))
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSend = () => sendMessage(input);

  return (
    <div className="h-screen flex flex-col bg-bg-nature overflow-hidden">
      {/* ── Hero Header ────────────────────────────────────────────── */}
      <div className="hero-gradient shrink-0 relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-accent-green/20 blur-[60px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-8 pt-28 pb-8 flex items-end justify-between relative z-10">
          <div className="flex items-center gap-5">
            {/* Animated bot avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                <Bot className="w-9 h-9 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-green rounded-full border-2 border-white shadow animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Farmer Mitra AI</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
                <span className="text-white/80 text-xs font-bold uppercase tracking-[0.15em]">
                  {t('online')}
                </span>
              </div>
            </div>
          </div>

          {/* Context badge */}
          {initialContext && onClearContext && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onClearContext}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-bold text-white hover:bg-white/30 transition-all"
            >
              <Leaf className="w-4 h-4 text-accent-green" />
              <span>{initialContext.disease}</span>
              <span className="text-white/60 text-xs">· {initialContext.confidence}%</span>
              <X className="w-3.5 h-3.5 opacity-60 ml-1" />
            </motion.button>
          )}

          {/* Sparkles */}
          <button className="p-3 bg-white/15 backdrop-blur-sm rounded-xl text-white border border-white/20 hover:bg-white/25 transition-all">
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Chat Area ──────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">

          {/* Quick prompt chips — shown only before first user message */}
          <AnimatePresence>
            {showQuickPrompts && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2"
              >
                {QUICK_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => sendMessage(t(prompt.text))}
                    className="flex flex-col items-start gap-2 p-4 bg-white border border-divider rounded-2xl text-left hover:border-muted-green hover:shadow-md transition-all group active:scale-95"
                  >
                    <div className="w-9 h-9 bg-bg-nature rounded-xl flex items-center justify-center group-hover:bg-accent-green/20 transition-colors">
                      <prompt.icon className="w-5 h-5 text-deep-green" />
                    </div>
                    <span className="text-sm font-bold text-text-primary leading-tight">{t(prompt.label)}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot avatar */}
                {msg.sender === 'bot' && (
                  <div className="w-9 h-9 hero-gradient rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className={`flex flex-col max-w-[72%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`relative group px-5 py-4 rounded-2xl shadow-sm text-base leading-relaxed ${msg.sender === 'user'
                    ? 'hero-gradient text-white rounded-br-sm'
                    : 'bg-white border border-divider text-text-primary rounded-bl-sm'
                    }`}>
                    {msg.isLoading ? (
                      <div className="flex items-center gap-1.5 py-1 px-1">
                        {[0, 150, 300].map((delay, i) => (
                          <motion.div
                            key={i}
                            className="w-2.5 h-2.5 bg-deep-green/40 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: delay / 1000, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className={`whitespace-pre-wrap ${msg.sender === 'bot' ? 'pr-16' : ''}`}>
                          {msg.text.replace(/\*\*/g, '')}
                        </p>
                        {msg.sender === 'bot' && (
                          <div className="absolute top-2 right-2 flex items-center bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-divider/50">
                            <SpeakButton text={msg.text} />
                            <CopyButton text={msg.text} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <span className="text-[11px] text-text-secondary/50 mt-1.5 px-1 font-medium">
                    {msg.timestamp}
                  </span>
                </div>

                {/* User avatar */}
                {msg.sender === 'user' && (
                  <div className="w-9 h-9 bg-bg-nature border border-divider rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <User className="w-5 h-5 text-deep-green" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Input Bar ──────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white/80 backdrop-blur-md border-t border-divider px-8 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 bg-bg-nature border border-divider rounded-2xl px-5 py-3 shadow-soft focus-within:border-muted-green focus-within:ring-4 focus-within:ring-accent-green/10 transition-all">
            <Leaf className="w-5 h-5 text-muted-green shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={t('askAnything')}
              disabled={isLoading}
              maxLength={500}
              className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-base py-1 text-text-primary placeholder:text-text-secondary/40 disabled:opacity-50"
            />
            <div className="flex items-center gap-2 shrink-0">
              {input.length > 0 && (
                <span className={`text-xs font-medium ${input.length > 450 ? 'text-red-400' : 'text-text-secondary/40'}`}>
                  {500 - input.length}
                </span>
              )}
              <motion.button
                type="button"
                onClick={toggleListening}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-colors ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white border border-divider text-text-secondary hover:bg-gray-50'
                }`}
                title={isListening ? "Stop Listening" : "Start Voice Input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </motion.button>
              <motion.button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 hero-gradient text-white rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-shadow"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          <p className="text-center text-[11px] text-text-secondary/40 mt-2.5 font-medium">
            Farmer Mitra AI
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Copy, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chatWithGemini } from '../../lib/gemini';
import { sanitizeText } from '../../lib/sanitize';
import { Analytics } from '../../lib/analytics';

interface Message { id: string; role: 'user' | 'assistant'; content: string }

const SYSTEM = `You are an expert AI assistant for students helping with programming, algorithms, career guidance, and academic concepts. Be concise and accurate. Format code with markdown code blocks.`;

export default function ChatAssistant() {
  const { profile, canMakeAIRequest, incrementAIUsage } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const send = async () => {
    const trimmed = sanitizeText(input).trim();
    if (!trimmed || loading) return;
    if (!canMakeAIRequest()) {
      setMessages((p) => [...p, { id: `limit-${Date.now()}`, role: 'assistant', content: `You've used all ${profile?.daily_ai_limit ?? 5} daily AI requests. Upgrade your plan or wait until tomorrow.` }]);
      return;
    }
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);
    try {
      await incrementAIUsage();
      const history = messages.map((m) => ({ role: m.role === 'user' ? 'user' as const : 'model' as const, text: m.content }));
      history.push({ role: 'user', text: trimmed });
      const resp = await chatWithGemini(history, SYSTEM);
      setMessages((p) => [...p, { id: `a-${Date.now()}`, role: 'assistant', content: resp }]);
      Analytics.aiRequestMade('chat', profile?.plan ?? 'free');
    } catch {
      setMessages((p) => [...p, { id: `e-${Date.now()}`, role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const renderContent = (text: string) =>
    text.split(/(```[\s\S]*?```)/g).map((part, i) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        const lang = lines[0].replace('```', '').trim();
        const code = lines.slice(1, -1).join('\n');
        return (
          <pre key={i} className="mt-2 overflow-x-auto rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-slate-200">
            {lang && <div className="mb-2 text-[10px] text-slate-500 uppercase font-bold">{lang}</div>}
            <code>{code}</code>
          </pre>
        );
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });

  const PROMPTS = ['Explain binary search', 'Help me with my resume', 'Best ML beginner projects', 'How to crack FAANG'];

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Chat Assistant</h2>
            <p className="text-[10px] text-slate-500">
              {profile?.daily_ai_limit === -1 ? 'Unlimited' : `${Math.max(0, (profile?.daily_ai_limit ?? 5) - (profile?.daily_ai_requests ?? 0))} requests left today`}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-800 hover:text-slate-300">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Bot className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Ask me anything</h3>
              <p className="mt-1 text-sm text-slate-500">Code, career advice, algorithms, projects...</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {PROMPTS.map((q) => (
                <button key={q} onClick={() => setInput(q)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition">{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mt-1">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div className={`group relative max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm'}`}>
              {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
              {msg.role === 'assistant' && (
                <button onClick={() => void copy(msg.id, msg.content)}
                  className="absolute -top-2 -right-2 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-slate-400 hover:text-white">
                  {copiedId === msg.id ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                </button>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-700 text-slate-400 mt-1">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-xl object-cover" /> : <User className="h-4 w-4" />}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-slate-800 px-4 py-3">
              <div className="flex gap-1.5">
                {[0,1,2].map((i) => (
                  <div key={i} className="h-2 w-2 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-end gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 focus-within:border-indigo-500 transition">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Ask anything... (Shift+Enter for new line)" rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none max-h-32" />
          <button onClick={() => void send()} disabled={!input.trim() || loading}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition active:scale-95">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-slate-600 text-center">AI can make mistakes. Verify important information.</p>
      </div>
    </div>
  );
}

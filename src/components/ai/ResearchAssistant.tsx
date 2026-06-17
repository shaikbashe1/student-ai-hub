import React, { useState } from 'react';
import { Search, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { researchTopic } from '../../lib/gemini';

type Depth = 'summary' | 'detailed';

export default function ResearchAssistant() {
  const { canMakeAIRequest, incrementAIUsage } = useAuth();
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<Depth>('detailed');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const research = async () => {
    if (!topic.trim()) return;
    if (!canMakeAIRequest()) { setError('Daily AI limit reached. Upgrade your plan.'); return; }
    setError(''); setLoading(true);
    try {
      await incrementAIUsage();
      const r = await researchTopic(topic, depth);
      setResult(r);
    } catch { setError('Research failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const renderMarkdown = (text: string) =>
    text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-purple-400 mt-4 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-white mt-5 mb-2 border-b border-slate-800 pb-2">{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="text-lg font-bold text-white mt-5 mb-3">{line.slice(2)}</h1>;
      if (line.startsWith('> ')) return <blockquote key={i} className="border-l-2 border-purple-500 pl-4 text-sm text-slate-400 italic my-2">{line.slice(2)}</blockquote>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <p key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-purple-500 flex-shrink-0">•</span>{line.slice(2)}</p>;
      if (line === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm text-slate-400 leading-relaxed">{line}</p>;
    });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">Research Assistant</h2>
        <p className="mt-1 text-sm text-slate-400">Deep-dive research on any topic with structured insights.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void research(); }}
          placeholder="e.g. Quantum Computing, Transformer Architecture, Blockchain scalability"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 flex-shrink-0">Depth:</span>
          {(['summary', 'detailed'] as Depth[]).map((d) => (
            <button key={d} onClick={() => setDepth(d)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition ${depth === d ? 'bg-purple-600 text-white' : 'border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{d}</button>
          ))}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button onClick={() => void research()} disabled={!topic.trim() || loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3 text-sm font-bold text-white hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 transition">
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Search className="h-4 w-4" /><Zap className="h-4 w-4" /></>}
          {loading ? 'Researching...' : 'Research Topic'}
        </button>
      </div>

      {result && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Research: {topic}</p>
            <button onClick={() => void navigator.clipboard.writeText(result)}
              className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 transition">Copy</button>
          </div>
          <div className="space-y-1">{renderMarkdown(result)}</div>
        </div>
      )}

      {!result && !loading && (
        <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center">
          <Search className="mx-auto h-10 w-10 text-slate-700 mb-3" />
          <p className="text-sm text-slate-500">Enter a topic above to start your research</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['Machine Learning Basics', 'System Design', 'Blockchain', 'Microservices'].map((t) => (
              <button key={t} onClick={() => setTopic(t)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700 transition">{t}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

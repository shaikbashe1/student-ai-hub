import React, { useState } from 'react';
import { Calendar, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { generateStudyPlan } from '../../lib/gemini';

type Mode = 'daily' | 'weekly' | 'semester';

export default function StudyPlanner() {
  const { canMakeAIRequest, incrementAIUsage } = useAuth();
  const [subjects, setSubjects] = useState('');
  const [mode, setMode] = useState<Mode>('daily');
  const [hours, setHours] = useState('3');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!subjects.trim()) { setError('Enter your subjects.'); return; }
    if (!canMakeAIRequest()) { setError('Daily AI limit reached.'); return; }
    setError(''); setLoading(true);
    try {
      await incrementAIUsage();
      const list = subjects.split(',').map((s) => s.trim()).filter(Boolean);
      const result = await generateStudyPlan(list, mode, parseInt(hours, 10));
      setPlan(result);
    } catch { setError('Generation failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const renderMarkdown = (text: string) =>
    text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-indigo-400 mt-4 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-white mt-5 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="text-lg font-bold text-white mt-5 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <p key={i} className="text-sm text-slate-300 pl-4 before:content-['•'] before:mr-2 before:text-indigo-500">{line.slice(2)}</p>;
      if (line.match(/^\d+\./)) return <p key={i} className="text-sm text-slate-300">{line}</p>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="text-sm font-semibold text-slate-200 mt-2">{line.slice(2, -2)}</p>;
      if (line === '') return <div key={i} className="h-1" />;
      return <p key={i} className="text-sm text-slate-400">{line}</p>;
    });

  if (plan) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Study Plan</h2>
          <p className="text-sm text-slate-500 capitalize">{mode} mode · {hours}h/day</p>
        </div>
        <button onClick={() => { setPlan(''); setSubjects(''); }}
          className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700 transition">
          New Plan
        </button>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-1">
        {renderMarkdown(plan)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white">Study Planner</h2>
        <p className="mt-1 text-sm text-slate-400">Get a structured study schedule tailored to your goals.</p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Subjects / Topics</label>
          <input type="text" value={subjects} onChange={(e) => setSubjects(e.target.value)}
            placeholder="e.g. Data Structures, DBMS, Computer Networks"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none" />
          <p className="mt-1 text-xs text-slate-600">Comma-separated</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Study Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {(['daily', 'weekly', 'semester'] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`rounded-xl py-2.5 text-sm font-medium capitalize transition ${mode === m ? 'bg-indigo-600 text-white' : 'border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{m}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Hours per day: {hours}h</label>
          <input type="range" min="1" max="12" value={hours} onChange={(e) => setHours(e.target.value)}
            className="w-full accent-indigo-500" />
          <div className="flex justify-between text-xs text-slate-600 mt-1"><span>1h</span><span>12h</span></div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button onClick={() => void generate()} disabled={!subjects.trim() || loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3 text-sm font-bold text-white hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 transition">
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Calendar className="h-4 w-4" /><Zap className="h-4 w-4" /></>}
          {loading ? 'Generating...' : 'Generate Study Plan'}
        </button>
      </div>
    </div>
  );
}

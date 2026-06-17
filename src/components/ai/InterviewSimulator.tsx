import React, { useState } from 'react';
import { Mic, Play, CheckCircle, ChevronRight, Star, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { generateInterviewQuestion, evaluateInterviewAnswer } from '../../lib/gemini';
import { Analytics } from '../../lib/analytics';

type Mode = 'technical' | 'hr' | 'mixed';
type Phase = 'setup' | 'active' | 'results';
interface QResult { question: string; answer: string; score: number; feedback: string }

export default function InterviewSimulator() {
  const { canMakeAIRequest, incrementAIUsage } = useAuth();
  const [phase, setPhase] = useState<Phase>('setup');
  const [role, setRole] = useState('');
  const [mode, setMode] = useState<Mode>('mixed');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState<QResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [qNum, setQNum] = useState(0);
  const MAX = 5;

  const start = async () => {
    if (!role.trim() || !canMakeAIRequest()) return;
    setLoading(true);
    try {
      await incrementAIUsage();
      const q = await generateInterviewQuestion(role, mode, []);
      setQuestion(q); setPhase('active'); setQNum(1);
      Analytics.interviewStarted(mode);
    } finally { setLoading(false); }
  };

  const submit = async () => {
    if (!answer.trim() || loading || !canMakeAIRequest()) return;
    setLoading(true);
    try {
      await incrementAIUsage();
      const eval_ = await evaluateInterviewAnswer(question, answer, role);
      const newResults = [...results, { question, answer, score: eval_.score, feedback: eval_.feedback }];
      setResults(newResults); setAnswer('');
      if (qNum >= MAX) { setPhase('results'); }
      else {
        await incrementAIUsage();
        const nextQ = await generateInterviewQuestion(role, mode, newResults.map((r) => r.question));
        setQuestion(nextQ); setQNum((n) => n + 1);
      }
    } finally { setLoading(false); }
  };

  const avg = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length * 10) : 0;

  if (phase === 'setup') return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white">Interview Simulator</h2>
        <p className="mt-1 text-sm text-slate-400">Practice with AI-generated questions and get instant feedback.</p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Target Role</label>
          <input type="text" value={role} onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Software Engineer Intern, Data Analyst"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Interview Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(['technical', 'hr', 'mixed'] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`rounded-xl py-2.5 text-sm font-medium capitalize transition ${mode === m ? 'bg-indigo-600 text-white' : 'border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{m}</button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-500 space-y-1">
          <p>✓ {MAX} AI-generated questions for your role</p>
          <p>✓ Instant scoring (0–10) with detailed feedback</p>
          <p>✓ Overall performance summary at the end</p>
        </div>
        <button onClick={() => void start()} disabled={!role.trim() || loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-bold text-white hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition">
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Play className="h-4 w-4" />}
          Start Interview
        </button>
      </div>
    </div>
  );

  if (phase === 'active') return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Question {qNum} of {MAX}</h2>
          <p className="text-xs text-slate-500 capitalize">{role} · {mode}</p>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: MAX }).map((_, i) => (
            <div key={i} className={`h-2 w-6 rounded-full transition ${i < results.length ? 'bg-emerald-500' : i === results.length ? 'bg-indigo-500' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mt-0.5">
            <Mic className="h-4 w-4" />
          </div>
          <p className="text-base text-slate-200 leading-relaxed">{question}</p>
        </div>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here..." rows={6}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none" />
        <button onClick={() => void submit()} disabled={!answer.trim() || loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition">
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <>{qNum < MAX ? 'Submit & Next' : 'Submit & Finish'}<ChevronRight className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="text-5xl mb-3">{avg >= 80 ? '🏆' : avg >= 60 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-white">Interview Complete!</h2>
        <p className="mt-1 text-slate-400 text-sm">{role} · {mode}</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 px-6 py-3">
          <span className="text-4xl font-bold text-indigo-400">{avg}%</span>
          <div className="text-left">
            <p className="text-xs text-slate-400">Overall Score</p>
            <p className="text-xs font-semibold text-white">{avg >= 80 ? 'Excellent' : avg >= 60 ? 'Good' : 'Keep practicing'}</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {results.map((r, i) => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-sm font-semibold text-white">Q{i + 1}: {r.question}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">{r.score}/10</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">{r.feedback}</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => { setPhase('setup'); setResults([]); setQNum(0); }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
        <RefreshCw className="h-4 w-4" /> Start New Interview
      </button>
    </div>
  );
}

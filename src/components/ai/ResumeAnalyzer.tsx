import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, AlertTriangle, Lightbulb, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { analyzeResume } from '../../lib/gemini';
import { Analytics } from '../../lib/analytics';
import { ResumeAnalysis } from '../../types';

const STYLES = {
  critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Critical' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Warning' },
  tip: { icon: Lightbulb, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Tip' },
} as const;

function ScoreRing({ score }: { score: number }) {
  const r = 52; const c = 2 * Math.PI * r;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400">ATS Score</span>
      </div>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const { canMakeAIRequest, incrementAIUsage } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === 'text/plain') { setResumeText(await file.text()); }
    else { setError('Please paste your resume text for best results.'); }
  };

  const analyze = async () => {
    if (!resumeText.trim()) { setError('Please paste your resume text.'); return; }
    if (!canMakeAIRequest()) { setError('Daily AI limit reached. Upgrade your plan.'); return; }
    setError(''); setLoading(true);
    try {
      await incrementAIUsage();
      const analysis = await analyzeResume(resumeText);
      setResult(analysis);
      Analytics.resumeAnalyzed(analysis.ats_score);
    } catch { setError('Analysis failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Resume Analyzer</h2>
        <p className="mt-1 text-sm text-slate-400">Get your ATS score, skill gaps, and actionable improvements.</p>
      </div>

      {!result ? (
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900 p-8 text-center cursor-pointer hover:border-indigo-500/50 transition"
            onClick={() => fileRef.current?.click()}>
            <Upload className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-300">Drop your resume or click to upload (.txt)</p>
            <input ref={fileRef} type="file" accept=".txt" onChange={handleFile} className="hidden" />
          </div>
          <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)}
            placeholder="Or paste your resume text here..." rows={12}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none font-mono" />
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
            </div>
          )}
          <button onClick={() => void analyze()} disabled={loading || !resumeText.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Analyzing...</> : <><Zap className="h-4 w-4" />Analyze Resume</>}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 py-6">
              <ScoreRing score={result.ats_score} />
              <p className="mt-2 text-xs text-slate-500 text-center px-4">
                {result.ats_score >= 80 ? 'Excellent ATS compatibility' : result.ats_score >= 60 ? 'Good, with room to improve' : 'Needs significant improvements'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Skills Detected</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.skills_detected.slice(0, 12).map((s) => (
                  <span key={s} className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">{s}</span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Skill Gaps</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.skill_gaps.length > 0
                  ? result.skill_gaps.slice(0, 8).map((g) => (
                      <span key={g} className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-400">{g}</span>
                    ))
                  : <p className="text-xs text-slate-500">No major gaps detected!</p>}
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Suggestions ({result.suggestions.length})</h3>
            <div className="space-y-3">
              {result.suggestions.map((s, i) => {
                const style = STYLES[s.type];
                const Icon = style.icon;
                return (
                  <div key={i} className={`flex gap-3 rounded-xl border p-4 ${style.bg}`}>
                    <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${style.color}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold ${style.color}`}>{style.label}</span>
                        <span className="text-xs text-slate-500">· {s.section}</span>
                      </div>
                      <p className="text-sm text-slate-300">{s.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button onClick={() => { setResult(null); setResumeText(''); }}
            className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
            Analyze Another Resume
          </button>
        </div>
      )}
    </div>
  );
}

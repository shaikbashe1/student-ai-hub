import React, { useState } from 'react';
import { Lightbulb, Github, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { generateProjectIdea } from '../../lib/gemini';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface ProjectIdea {
  title: string;
  description: string;
  tech_stack: string[];
  features: string[];
  architecture_overview: string;
  estimated_days: number;
}

export default function ProjectGenerator() {
  const { canMakeAIRequest, incrementAIUsage } = useAuth();
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [projects, setProjects] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!skills.trim()) { setError('Enter your skills.'); return; }
    if (!canMakeAIRequest()) { setError('Daily AI limit reached. Upgrade your plan.'); return; }
    setError(''); setLoading(true);
    try {
      await incrementAIUsage();
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const interestList = interests.split(',').map((s) => s.trim()).filter(Boolean);
      const idea = await generateProjectIdea(skillList, interestList, difficulty) as ProjectIdea;
      setProjects((prev) => [idea, ...prev].slice(0, 5));
    } catch { setError('Generation failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const DIFF_COLORS: Record<Difficulty, string> = {
    beginner: 'bg-emerald-500/10 text-emerald-400',
    intermediate: 'bg-amber-500/10 text-amber-400',
    advanced: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">Project Idea Generator</h2>
        <p className="mt-1 text-sm text-slate-400">Get unique project ideas to build your portfolio.</p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Your Skills</label>
            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Python, SQL..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Interests (optional)</label>
            <input type="text" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="health, gaming, education..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Difficulty:</span>
          {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((d) => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition ${difficulty === d ? 'bg-indigo-600 text-white' : 'border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{d}</button>
          ))}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button onClick={() => void generate()} disabled={!skills.trim() || loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-3 text-sm font-bold text-white hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 transition">
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Lightbulb className="h-4 w-4" /><Zap className="h-4 w-4" /></>}
          {loading ? 'Generating...' : 'Generate Project Idea'}
        </button>
      </div>
      {projects.length > 0 && (
        <div className="space-y-4">
          {projects.map((p, i) => (
            <div key={i} className={`rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3 ${i === 0 ? 'ring-1 ring-indigo-500/30' : ''}`}>
              {i === 0 && <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Latest Idea</div>}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-white">{p.title}</h3>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DIFF_COLORS[difficulty]}`}>{difficulty}</span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{p.estimated_days}d</span>
                </div>
              </div>
              <p className="text-sm text-slate-400">{p.description}</p>
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-1.5">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tech_stack.map((t) => <span key={t} className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-400">{t}</span>)}
                </div>
              </div>
              {p.features.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-1.5">Key Features</p>
                  <ul className="space-y-0.5">{p.features.map((f) => <li key={f} className="text-xs text-slate-400">- {f}</li>)}</ul>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <a href="https://github.com/search" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition">
                  <Github className="h-3.5 w-3.5" /> Find examples
                </a>
                <button onClick={() => void generate()} className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition">
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Map, ChevronDown, ChevronUp, Zap, BookOpen, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { generateRoadmap } from '../../lib/gemini';
import { LearningRoadmap } from '../../types';

export default function RoadmapGenerator() {
  const { canMakeAIRequest, incrementAIUsage } = useAuth();
  const [goal, setGoal] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const generate = async () => {
    if (!goal.trim()) { setError('Enter your learning goal.'); return; }
    if (!canMakeAIRequest()) { setError('Daily AI limit reached. Upgrade your plan.'); return; }
    setError(''); setLoading(true);
    try {
      await incrementAIUsage();
      const skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
      const r = await generateRoadmap(goal, skills);
      setRoadmap(r);
      setExpanded({ 0: true });
    } catch { setError('Generation failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const toggle = (i: number) => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));

  if (roadmap) return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">{roadmap.title}</h2>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-3 py-0.5 text-xs text-slate-400">
              <Clock className="h-3 w-3" /> {roadmap.estimated_weeks} weeks
            </span>
            <span className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-3 py-0.5 text-xs text-slate-400">
              <BookOpen className="h-3 w-3" /> {(roadmap.phases ?? []).length} phases
            </span>
          </div>
        </div>
        <button onClick={() => setRoadmap(null)}
          className="flex-shrink-0 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700 transition">
          New Roadmap
        </button>
      </div>

      <div className="space-y-3">
        {(roadmap.phases ?? []).map((phase, i) => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <button onClick={() => toggle(i)} className="flex w-full items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm font-bold text-indigo-400">{i + 1}</div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{phase.title}</p>
                  <p className="text-xs text-slate-500">{phase.duration}</p>
                </div>
              </div>
              {expanded[i] ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
            </button>
            {expanded[i] && (
              <div className="border-t border-slate-800 px-5 pb-5 space-y-3">
                <p className="text-sm text-slate-400 mt-3">{phase.description}</p>
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-2">Topics to Cover</p>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.topics.map((t) => (
                      <span key={t} className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">{t}</span>
                    ))}
                  </div>
                </div>
                {phase.resources.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-300 mb-2">Resources</p>
                    <ul className="space-y-1">
                      {phase.resources.map((r) => (
                        <li key={r.name} className="text-xs text-slate-400">
                          <span className="text-slate-300 font-medium">{r.name}</span>
                          {r.type && <span className="ml-1.5 rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-500 capitalize">{r.type}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {phase.projects.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-300 mb-2">Projects</p>
                    <ul className="space-y-1 list-disc list-inside">
                      {phase.projects.map((p) => <li key={p} className="text-xs text-slate-400">{p}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {roadmap.final_project && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">Final Capstone Project</p>
          <p className="text-sm text-slate-300">{roadmap.final_project}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white">Learning Roadmap Generator</h2>
        <p className="mt-1 text-sm text-slate-400">Get a personalized, week-by-week learning plan.</p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Learning Goal</label>
          <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Become a Full Stack Developer, Learn Machine Learning"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Current Skills (optional)</label>
          <input type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="e.g. HTML, CSS, basic Python"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none" />
          <p className="mt-1 text-xs text-slate-600">Comma-separated list</p>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button onClick={() => void generate()} disabled={!goal.trim() || loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition">
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Map className="h-4 w-4" /><Zap className="h-4 w-4" /></>}
          {loading ? 'Generating...' : 'Generate Roadmap'}
        </button>
      </div>
    </div>
  );
}

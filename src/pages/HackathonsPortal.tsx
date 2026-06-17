import React, { useState } from 'react';
import { Trophy, Calendar, ExternalLink, Globe } from 'lucide-react';

interface HackathonItem {
  id: string;
  title: string;
  organizer: string;
  description: string;
  deadline: string;
  prize?: string;
  tags: string[];
  url: string;
  is_online: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const SAMPLE: HackathonItem[] = [
  { id: '1', title: 'Google Summer of Code 2025', organizer: 'Google', description: 'Open source internship program with mentoring organizations.', deadline: '2025-04-02', prize: '$1500-$3300 stipend', tags: ['Open Source', 'Mentorship'], url: 'https://summerofcode.withgoogle.com', is_online: true, difficulty: 'intermediate' },
  { id: '2', title: 'MLH Global Hackathon', organizer: 'Major League Hacking', description: 'The worlds largest hackathon league. Build something amazing in 48 hours.', deadline: '2025-07-15', prize: 'Prizes + swag', tags: ['AI/ML', 'Web Dev', 'Hardware'], url: 'https://mlh.io', is_online: true, difficulty: 'beginner' },
  { id: '3', title: 'NASA Space Apps Challenge', organizer: 'NASA', description: 'International hackathon focused on space exploration and earth observation.', deadline: '2025-09-30', prize: 'Recognition + mentorship', tags: ['Space', 'Data Science', 'Sustainability'], url: 'https://www.spaceappschallenge.org', is_online: true, difficulty: 'advanced' },
  { id: '4', title: 'HackerEarth University Hack', organizer: 'HackerEarth', description: 'Build innovative solutions to real-world problems globally.', deadline: '2025-08-10', prize: '$5000', tags: ['FinTech', 'HealthTech', 'EdTech'], url: 'https://hackerearth.com', is_online: true, difficulty: 'intermediate' },
];

export default function HackathonsPortal() {
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const filtered = filter === 'all' ? SAMPLE : SAMPLE.filter((h) => h.difficulty === filter);

  const DIFF_STYLES: Record<string, string> = {
    beginner: 'bg-emerald-500/10 text-emerald-400',
    intermediate: 'bg-amber-500/10 text-amber-400',
    advanced: 'bg-red-500/10 text-red-400',
  };

  const daysLeft = (deadline: string) => {
    const now = Date.now();
    const d = Math.ceil((new Date(deadline).getTime() - now) / 86400000);
    if (d < 0) return 'Closed';
    if (d === 0) return 'Today!';
    return `${d}d left`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Trophy className="h-6 w-6 text-amber-400" /> Hackathons</h1>
          <p className="text-sm text-slate-400 mt-0.5">Competitions to build your portfolio and win prizes</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? 'bg-slate-700 text-white' : 'border border-slate-700 text-slate-400 hover:bg-slate-800'}`}>{f}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((h) => (
          <div key={h.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex flex-col gap-3 hover:border-slate-700 transition">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">{h.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{h.organizer}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${DIFF_STYLES[h.difficulty]}`}>{h.difficulty}</span>
                {h.is_online && <span className="flex items-center gap-1 text-[10px] text-slate-500"><Globe className="h-3 w-3" />Online</span>}
              </div>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{h.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {h.tags.map((t) => <span key={t} className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{t}</span>)}
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex gap-3">
                <span className="flex items-center gap-1 text-slate-500"><Calendar className="h-3 w-3" />{daysLeft(h.deadline)}</span>
                {h.prize && <span className="text-emerald-400">{h.prize}</span>}
              </div>
              <a href={h.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition">
                Register <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, MapPin, Building2, Briefcase, Clock, RefreshCw } from 'lucide-react';
import { fetchAllJobs } from '../../lib/jobs';
import type { JobListing } from '../../lib/jobs';

export default function LiveJobFeed() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('software engineer intern');
  const [search, setSearch] = useState(query);
  const [error, setError] = useState('');

  const load = async (q: string) => {
    setLoading(true); setError('');
    try {
      const results = await fetchAllJobs(q);
      setJobs(results);
    } catch { setError('Failed to load jobs. Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(query); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doSearch = () => { setQuery(search); void load(search); };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 30) return `${d}d ago`;
    return `${Math.floor(d / 30)}mo ago`;
  };

  const SOURCE_BADGE: Record<string, string> = {
    adzuna: 'bg-blue-500/10 text-blue-400',
    remotive: 'bg-emerald-500/10 text-emerald-400',
    arbeitnow: 'bg-purple-500/10 text-purple-400',
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Live Job Feed</h1>
        <p className="text-sm text-slate-400 mt-0.5">Aggregated from Adzuna, Remotive, and Arbeitnow</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
            placeholder="Search jobs, roles, companies..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none" />
        </div>
        <button onClick={doSearch}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition">
          Search
        </button>
        <button onClick={() => void load(query)} className="rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-400 hover:bg-slate-700 transition">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-800/50" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
          <Briefcase className="mx-auto h-10 w-10 text-slate-700 mb-3" />
          <p className="text-sm text-slate-500">No jobs found. Try a different search.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">{jobs.length} jobs found for &quot;{query}&quot;</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {jobs.map((job) => (
              <div key={job.id} className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-indigo-400 transition">{job.title}</h3>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                      <Building2 className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{job.company}</span>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${SOURCE_BADGE[job.source] ?? 'bg-slate-800 text-slate-400'}`}>
                    {job.source}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {job.location && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />{job.location}
                    </span>
                  )}
                  {job.type && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Briefcase className="h-3 w-3" />{job.type}
                    </span>
                  )}
                  {job.posted_at && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />{timeAgo(job.posted_at)}
                    </span>
                  )}
                </div>

                {job.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">{job.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-1">
                  {job.salary && <span className="text-xs font-medium text-emerald-400">{job.salary}</span>}
                  <a href={job.url} target="_blank" rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1.5 rounded-xl bg-indigo-600/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-600/20 transition">
                    Apply <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Search, Heart, Briefcase, ExternalLink, Filter, Calendar, MapPin, DollarSign, X } from "lucide-react";
import { Profile, Internship } from "../types";

interface InternshipsPortalProps {
  currentUser: Profile | null;
  savedItemIds: string[];
  onToggleSave: (itemType: 'tool' | 'internship' | 'hackathon', itemId: string) => void;
  onOpenLogin: () => void;
}

export default function InternshipsPortal({
  currentUser,
  savedItemIds,
  onToggleSave,
  onOpenLogin,
}: InternshipsPortalProps) {
  const [jobs, setJobs] = useState<Internship[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Internship | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, remoteOnly]);

  const fetchJobs = async () => {
    try {
      const q = new URLSearchParams();
      if (searchQuery) q.append("search", searchQuery);
      if (remoteOnly) q.append("remoteOnly", "true");

      const res = await fetch(`/api/internships?${q.toString()}`);
      const data = await res.json();
      if (data.internships) {
        setJobs(data.internships);
      }
    } catch (err) {
      console.error("Error fetching internships:", err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6" id="internships-portal-container">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Internship Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Accelerate your technical career by exploring active, high-yield technology internships.</p>
        </div>
      </div>

      {/* Advanced search and filters */}
      <div className="space-y-4 mb-8 bg-slate-900/10 p-4 rounded-2xl border border-slate-900/60 flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Search Input box */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by company name, technology requirements, or cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 hover:border-slate-700/80 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Remote Toggles */}
        <div className="flex items-center space-x-3 shrink-0">
          <label className="flex items-center cursor-pointer space-x-2">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider text-[10px]">Remote Only</span>
          </label>
        </div>
      </div>

      {/* Grid listing */}
      {jobs.length === 0 ? (
        <div className="text-center py-16 border border-slate-900 rounded-3xl bg-slate-950/20 max-w-md mx-auto">
          <Briefcase className="h-8 w-8 mx-auto text-slate-600 opacity-40 mb-3" />
          <h3 className="font-display font-bold text-sm text-slate-300">No Listings Located</h3>
          <p className="text-xs text-slate-500 mt-1">Try modifying your query keyword parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" id="internships-cards-grid">
          {jobs.map((job) => {
            const isSaved = savedItemIds.includes(job.id);
            return (
              <div
                key={job.id}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/30 p-5 hover:border-indigo-500/30 duration-300 transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    {/* Remote/Onsite label */}
                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest border ${
                      job.is_remote
                        ? "bg-purple-500/15 border-purple-500/30 text-purple-400"
                        : "bg-teal-500/15 border-teal-500/30 text-teal-400"
                    }`}>
                      {job.is_remote ? "Remote" : "Onsite"}
                    </span>
                    
                    {/* Star toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!currentUser) {
                          onOpenLogin();
                          return;
                        }
                        onToggleSave('internship', job.id);
                      }}
                      className={`p-1.5 rounded-xl border transition duration-150 cursor-pointer ${
                        isSaved
                          ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-slate-800"
                          : "bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? "fill-red-400" : ""}`} />
                    </button>
                  </div>

                  {/* Company Logo and Name */}
                  <div className="flex items-center space-x-2.5 mt-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-400">
                      {job.company[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{job.company}</h4>
                      <h3 className="font-display text-sm font-bold text-white mt-0.5 group-hover:text-indigo-400 duration-150">{job.role}</h3>
                    </div>
                  </div>

                  {/* Quick stats on cards */}
                  <div className="mt-4 space-y-2 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span>{job.location}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="font-bold text-slate-200">{job.stipend}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-semibold uppercase">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Apply before: {job.deadline}</span>
                  </div>

                  <button
                    onClick={() => setSelectedJob(job)}
                    className="text-xs text-indigo-400 font-bold hover:text-indigo-300"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Internship Full Modal Page Detail sheet */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header selection card */}
            <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm font-bold text-indigo-400">
                  {selectedJob.company[0]}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-white text-base leading-none">{selectedJob.company}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5 tracking-wider">Indexed technical vacancy</p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-100 font-bold px-2 py-1 hover:bg-slate-800 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            {/* Core layout */}
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-extrabold text-lg text-white">{selectedJob.role}</h3>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <span className="flex items-center text-xs text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-500 mr-1" />
                    {selectedJob.location}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center text-xs text-emerald-400 font-bold">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-500/80 mr-0.5" />
                    Stipend pool: {selectedJob.stipend}
                  </span>
                </div>
              </div>

              {/* Requirement eligibility spec block (required by spec!) */}
              <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 space-y-2">
                <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400">Eligibility Specifications</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedJob.eligibility}
                </p>
              </div>

              {/* Deadlines progress bars */}
              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>Deadline application countdown: <strong className="text-white">{selectedJob.deadline}</strong></span>
              </div>

              {/* Links actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (!currentUser) onOpenLogin();
                    else onToggleSave('internship', selectedJob.id);
                  }}
                  className={`flex items-center space-x-1.5 text-xs font-semibold border px-4 py-2 rounded-xl duration-150 ${
                    savedItemIds.includes(selectedJob.id)
                      ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-slate-800"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-300"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${savedItemIds.includes(selectedJob.id) ? "fill-red-400" : ""}`} />
                  <span>
                    {savedItemIds.includes(selectedJob.id) ? "Bookmarked" : "Save Internship"}
                  </span>
                </button>

                <a
                  href={selectedJob.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20 px-5 py-2 hover:shadow-md text-xs font-bold text-white flex items-center space-x-1.5 duration-100"
                >
                  <span>Apply Externally</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Search, Heart, Trophy, ExternalLink, Calendar, Users, Award, ShieldAlert } from "lucide-react";
import { Profile, Hackathon } from "../types";

interface HackathonsPortalProps {
  currentUser: Profile | null;
  savedItemIds: string[];
  onToggleSave: (itemType: 'tool' | 'internship' | 'hackathon', itemId: string) => void;
  onOpenLogin: () => void;
}

export default function HackathonsPortal({
  currentUser,
  savedItemIds,
  onToggleSave,
  onOpenLogin,
}: HackathonsPortalProps) {
  const [hacks, setHacks] = useState<Hackathon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHack, setSelectedHack] = useState<Hackathon | null>(null);

  useEffect(() => {
    fetchHackathons();
  }, [searchQuery]);

  const fetchHackathons = async () => {
    try {
      const q = new URLSearchParams();
      if (searchQuery) q.append("search", searchQuery);

      const res = await fetch(`/api/hackathons?${q.toString()}`);
      const data = await res.json();
      if (data.hackathons) {
        setHacks(data.hackathons);
      }
    } catch (err) {
      console.error("Error loading hackathons directory:", err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6" id="hackathons-portal-container">
      
      {/* Header section card */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Hackathon Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Join technical hackathons, form student developer teams, and win prize pools of epic scales.</p>
        </div>
      </div>

      {/* Advanced search widget */}
      <div className="relative mb-8 max-w-7xl bg-slate-900/10 p-4 border border-slate-900/60 rounded-2xl">
        <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search global hackathons, prize criteria, eligibility terms (e.g. Google)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3.5 pl-11 pr-4 text-xs text-white placeholder-slate-500 hover:border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Lists of hackathons */}
      {hacks.length === 0 ? (
        <div className="text-center py-16 border border-slate-900 rounded-3xl bg-slate-950/20 max-w-md mx-auto relative">
          <Trophy className="h-8 w-8 mx-auto text-slate-600 opacity-40 mb-3" />
          <h3 className="font-display font-bold text-sm text-slate-300">No Events Located</h3>
          <p className="text-xs text-slate-500 mt-1">Try modifying your query search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" id="hackathons-cards-grid">
          {hacks.map((hack) => {
            const isSaved = savedItemIds.includes(hack.id);
            return (
              <div
                key={hack.id}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/30 p-5 hover:border-indigo-500/30 duration-300 transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    {/* Prize pool indicator badge (required by spec!) */}
                    <span className="inline-flex items-center space-x-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[9px] font-extrabold text-amber-400 uppercase tracking-widest">
                      <Award className="h-3.5 w-3.5 mr-0.5" />
                      <span>{hack.prize_pool}</span>
                    </span>

                    {/* Bookmark star toggler */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!currentUser) {
                          onOpenLogin();
                          return;
                        }
                        onToggleSave('hackathon', hack.id);
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

                  {/* Organizer titles on card */}
                  <div className="mt-4">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{hack.organizer}</p>
                    <h3 className="font-display text-base font-bold text-slate-100 mt-1.5 group-hover:text-indigo-400 duration-150">
                      {hack.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    Eligibility: {hack.eligibility}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-[9px] text-slate-500 font-semibold uppercase">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Apply before: {hack.deadline}</span>
                  </div>

                  <button
                    onClick={() => setSelectedHack(hack)}
                    className="text-xs text-indigo-400 font-bold hover:text-indigo-300"
                  >
                    Register
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Dialog Modal sheet for Hackathon */}
      {selectedHack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header selection card */}
            <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm font-bold text-amber-400">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-white text-sm leading-none">{selectedHack.organizer}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mt-1 tracking-wider">Host event compiler</p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedHack(null)}
                className="text-slate-400 hover:text-slate-100 font-bold px-2 py-1 hover:bg-slate-800 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            {/* Core details layout */}
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-extrabold text-lg text-white">{selectedHack.name}</h3>
                <div className="flex items-center space-x-1 mt-2.5">
                  <span className="text-[11px] font-bold text-amber-400 border border-amber-500/15 bg-amber-500/5 px-2.5 py-0.5 rounded uppercase">
                    Prize Pool: {selectedHack.prize_pool}
                  </span>
                </div>
              </div>

              {/* Requirement eligibility spec block (required by spec!) */}
              <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 space-y-2">
                <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400 font-mono">Participation Eligibility Rules</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedHack.eligibility}
                </p>
              </div>

              {/* Deadline date */}
              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>Registration submission cut-off date: <strong className="text-white">{selectedHack.deadline}</strong></span>
              </div>

              {/* Links actions (registration link required by spec!) */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (!currentUser) onOpenLogin();
                    else onToggleSave('hackathon', selectedHack.id);
                  }}
                  className={`flex items-center space-x-1.5 text-xs font-semibold border px-4 py-2 rounded-xl duration-150 ${
                    savedItemIds.includes(selectedHack.id)
                      ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-slate-800"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-300"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${savedItemIds.includes(selectedHack.id) ? "fill-red-400" : ""}`} />
                  <span>
                    {savedItemIds.includes(selectedHack.id) ? "Bookmarked" : "Save Hackathon"}
                  </span>
                </button>

                <a
                  href={selectedHack.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20 px-5 py-2 hover:shadow-md text-xs font-bold text-white flex items-center space-x-1.5 duration-100"
                >
                  <span>Submit Registration</span>
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

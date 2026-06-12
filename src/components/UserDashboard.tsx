import React, { useState, useEffect } from "react";
import { 
  Sparkles, Heart, MessageSquare, User, Mail, Calendar, 
  Trash2, ShieldCheck, Bookmark, ExternalLink, RefreshCw 
} from "lucide-react";
import { Profile, AITool, Internship, Hackathon, ChatSession } from "../types";

interface UserDashboardProps {
  currentUser: Profile | null;
  savedItemIds: string[];
  onToggleSave: (itemType: 'tool' | 'internship' | 'hackathon', itemId: string) => void;
  onOpenLogin: () => void;
  allTools: AITool[];
  allInternships: Internship[];
  allHackathons: Hackathon[];
  setActiveTab: (tab: string) => void;
}

export default function UserDashboard({
  currentUser,
  savedItemIds,
  onToggleSave,
  onOpenLogin,
  allTools,
  allInternships,
  allHackathons,
  setActiveTab,
}: UserDashboardProps) {
  // Filter core bookmarks
  const starredTools = allTools.filter((t) => savedItemIds.includes(t.id));
  const starredInternships = allInternships.filter((i) => savedItemIds.includes(i.id));
  const starredHackathons = allHackathons.filter((h) => savedItemIds.includes(h.id));

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeBookmarkTab, setActiveBookmarkTab] = useState<"tools" | "internships" | "hackathons">("tools");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadHistory();
    }
  }, [currentUser]);

  const loadHistory = async () => {
    if (!currentUser) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/ai/sessions?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.sessions) {
        setChatSessions(data.sessions);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteSession = async (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/ai/session?sessionId=${sessId}`, { method: "DELETE" });
      if (res.ok) {
        setChatSessions(chatSessions.filter((s) => s.id !== sessId));
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 text-center space-y-4" id="dashboard-requires-login">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto">
          <Bookmark className="h-7 w-7" />
        </div>
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">Your Personal Student Hub</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            Please log in to view saved items, study-room AI chat session logs, and profile metrics.
          </p>
        </div>
        <button
          onClick={onOpenLogin}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold px-5 py-2.5 text-white shadow-md hover:shadow-indigo-500/20 active:scale-95 duration-100"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-10" id="user-dashboard-container">
      
      {/* Overview stats layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card details */}
        <div className="md:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-5">
          <div className="flex items-center space-x-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-lg text-lg">
              {currentUser.name[0]}
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">{currentUser.name}</h3>
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase mt-1 ${
                currentUser.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
              }`}>
                {currentUser.role === 'admin' ? "System Admin" : "Active Student"}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-slate-900">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <span className="truncate">{currentUser.email}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Joined: {new Date(currentUser.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Prompt status summary widget */}
          <div className="mt-4 p-3 rounded-xl border border-indigo-500/10 bg-indigo-500/5">
            <h4 className="text-[10px] uppercase font-bold text-indigo-400">Daily Free Quota remaining</h4>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-300">AI Prompt Tokens:</span>
              <strong className="text-white text-xs">{currentUser.daily_prompt_count} / 20 Remaining</strong>
            </div>
            
            {currentUser.role !== 'admin' && (
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 mt-2">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${(currentUser.daily_prompt_count / 20) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Saved Opportunities Bookmarks List (Span 2) */}
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/30 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-900">
              <h3 className="font-display font-bold text-white text-md">Your Bookmarked Content</h3>
              
              {/* Bookmark tab selections */}
              <div className="flex space-x-1 border border-slate-800 bg-slate-950/60 p-0.5 rounded-lg">
                {(["tools", "internships", "hackathons"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveBookmarkTab(tab)}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition duration-150 ${
                      activeBookmarkTab === tab
                        ? "bg-slate-905 text-indigo-400 bg-slate-900 shadow-sm font-extrabold"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookmarked lists */}
            <div className="space-y-3 min-h-[160px] max-h-[220px] overflow-y-auto">
              
              {/* Tools list tab */}
              {activeBookmarkTab === "tools" && (
                starredTools.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-10">No saved tools. Browse our directory and star some!</p>
                ) : (
                  starredTools.map((tool) => (
                    <div key={tool.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{tool.name}</h4>
                        <span className="text-[9px] uppercase font-bold text-indigo-400 mt-1 inline-block bg-indigo-500/5 px-2 py-0.5 rounded">{tool.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setActiveTab("tools")}
                          className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-1 bg-slate-900 rounded"
                        >
                          Launch
                        </button>
                        <button
                          onClick={() => onToggleSave('tool', tool.id)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 duration-100"
                          title="Remove bookmark"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}

              {/* Internships list tab */}
              {activeBookmarkTab === "internships" && (
                starredInternships.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-10">No bookmarked internship vacancies yet.</p>
                ) : (
                  starredInternships.map((job) => (
                    <div key={job.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{job.role}</h4>
                        <span className="text-[10px] text-indigo-400 font-semibold">{job.company}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={job.apply_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10.5px] font-bold text-indigo-400 hover:underline flex items-center space-x-1"
                        >
                          <span>Apply</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <button
                          onClick={() => onToggleSave('internship', job.id)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 duration-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}

              {/* Hackathons list tab */}
              {activeBookmarkTab === "hackathons" && (
                starredHackathons.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-10">No bookmarked hackathon vacancies listed.</p>
                ) : (
                  starredHackathons.map((hack) => (
                    <div key={hack.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{hack.name}</h4>
                        <span className="text-[9px] uppercase font-bold text-amber-500">{hack.prize_pool} pool</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={hack.registration_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10.5px] font-bold text-indigo-400 hover:underline flex items-center space-x-1"
                        >
                          <span>Register</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <button
                          onClick={() => onToggleSave('hackathon', hack.id)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 duration-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}

            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-900 flex justify-end text-xs font-medium text-slate-500">
            Quick Shortcut: Browse matching portals above to bookmark real data!
          </div>
        </div>

      </div>

      {/* Persistent AI chat session log histories */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-500/10 text-indigo-400">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h3 className="font-display font-bold text-white text-md">Your Previous AI Chats</h3>
          </div>

          <button 
            onClick={loadHistory}
            disabled={isRefreshing}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 disabled:opacity-40"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync logs</span>
          </button>
        </div>

        {chatSessions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-10">No historic conversation files found. Jump to active AI Coder and send your first query!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chatSessions.map((sess) => (
              <div 
                key={sess.id}
                onClick={() => setActiveTab("assistant")}
                className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition duration-150 cursor-pointer flex justify-between items-start group relative"
              >
                <div className="space-y-1 pr-4">
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 duration-150 truncate max-w-[180px]">{sess.title}</h4>
                  <p className="text-[10px] text-slate-500">{new Date(sess.created_at).toLocaleDateString()} @ {new Date(sess.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                <button
                  onClick={(e) => handleDeleteSession(sess.id, e)}
                  className="text-slate-600 hover:text-red-400 p-1 hover:bg-slate-900 rounded shrink-0 duration-100"
                  title="Wipe conversation logs permanently"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

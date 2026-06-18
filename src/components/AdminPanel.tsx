import React, { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash2, ShieldAlert, Sparkles, FolderPlus, 
  HelpCircle, UserCheck, Trash, ExternalLink, Code2, RefreshCw, BookOpen
} from "lucide-react";
import { Profile, AITool, Internship, Hackathon, BlogPost, AIToolCategory } from "../types";
import BlogEditor from "./blog/BlogEditor";

interface AdminPanelProps {
  currentUser: Profile | null;
  triggerDataReload: () => void;
}

export default function AdminPanel({
  currentUser,
  triggerDataReload,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"tools" | "internships" | "hackathons" | "users" | "blog">("tools");
  const [isSyncing, setIsSyncing] = useState(false);

  // Entities state
  const [tools, setTools] = useState<AITool[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  // Blog editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);

  // CRUD Dialog Modals states
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Partial<AITool> | null>(null);

  const [internshipModalOpen, setInternshipModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Partial<Internship> | null>(null);

  const [hackathonModalOpen, setHackathonModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<Partial<Hackathon> | null>(null);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      syncAllData();
    }
  }, [currentUser, activeTab]);

  /** Helper: always send admin identity via x-user-id header */
  const adminHeaders = () => ({
    "Content-Type": "application/json",
    "x-user-id": currentUser?.id ?? ""
  });

  const syncAllData = async () => {
    setIsSyncing(true);
    try {
      if (activeTab === "tools") {
        const res = await fetch("/api/tools");
        const data = await res.json();
        if (data.tools) setTools(data.tools);
      } else if (activeTab === "internships") {
        const res = await fetch("/api/internships");
        const data = await res.json();
        if (data.internships) setInternships(data.internships);
      } else if (activeTab === "hackathons") {
        const res = await fetch("/api/hackathons");
        const data = await res.json();
        if (data.hackathons) setHackathons(data.hackathons);
      } else if (activeTab === "users") {
        const res = await fetch(`/api/admin/users`, {
          headers: { "x-user-id": currentUser?.id ?? "" }
        });
        const data = await res.json();
        if (data.users) setUsers(data.users);
      } else if (activeTab === "blog") {
        const res = await fetch("/api/blog");
        const data = await res.json();
        if (data.posts) setBlogs(data.posts);
      }
    } catch (err) {
      console.error("Error loaded admin datasets:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- CRUD ACTIONS FOR TOOLS ---
  const handleSaveToolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool || !currentUser) return;

    try {
      const res = await fetch("/api/admin/tools", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({ tool: editingTool }),
      });

      if (res.ok) {
        setToolModalOpen(false);
        setEditingTool(null);
        syncAllData();
        triggerDataReload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to delete this AI Tool listing?")) return;
    try {
      const res = await fetch(`/api/admin/tools/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUser.id }
      });
      if (res.ok) {
        syncAllData();
        triggerDataReload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- CRUD ACTIONS FOR INTERNSHIPS ---
  const handleSaveInternshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInternship || !currentUser) return;

    try {
      const res = await fetch("/api/admin/internships", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({ internship: editingInternship }),
      });

      if (res.ok) {
        setInternshipModalOpen(false);
        setEditingInternship(null);
        syncAllData();
        triggerDataReload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInternship = async (id: string) => {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to delete this Internship vacancy?")) return;
    try {
      const res = await fetch(`/api/admin/internships/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUser.id }
      });
      if (res.ok) {
        syncAllData();
        triggerDataReload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- CRUD ACTIONS FOR HACKATHONS ---
  const handleSaveHackathonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHackathon || !currentUser) return;

    try {
      const res = await fetch("/api/admin/hackathons", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({ hackathon: editingHackathon }),
      });

      if (res.ok) {
        setHackathonModalOpen(false);
        setEditingHackathon(null);
        syncAllData();
        triggerDataReload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHackathon = async (id: string) => {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to delete this Hackathon?")) return;
    try {
      const res = await fetch(`/api/admin/hackathons/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUser.id }
      });
      if (res.ok) {
        syncAllData();
        triggerDataReload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- CRUD ACTIONS FOR BLOGS ---
  const handleSaveBlogSubmit = async (blogData: Partial<BlogPost>) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({ post: blogData })
      });
      if (res.ok) {
        setEditorOpen(false);
        setEditingBlog(null);
        syncAllData();
      }
    } catch (err) {
      console.error("Error saving blog article:", err);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to delete this strategic publication?")) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUser.id }
      });
      if (res.ok) {
        syncAllData();
      }
    } catch (err) {
      console.error("Error deleting blog article:", err);
    }
  };

  // If not admin, block screen immediately
  if (currentUser?.role !== "admin") {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center space-y-4" id="admin-unauthorized-view">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display font-extrabold text-lg text-white">Console Access Gated</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            You do not possess the required administrator verification tokens. Switch to the developer sandbox profile to try the view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8" id="admin-dashboard-container">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-slate-900 gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-amber-500 font-bold bg-amber-400/5 px-2.5 py-0.5 rounded tracking-widest">
            Level 3 Credentials Active
          </span>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl mt-1.5 flex items-center space-x-1.5">
            <ShieldAlert className="h-7 w-7 text-amber-500" />
            <span>Administrator Control Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Maintain, list, edit, or delete platform tools directories, opportunities, or view users.</p>
        </div>

        {/* Sync loading widgets */}
        <button 
          onClick={syncAllData} 
          disabled={isSyncing}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center space-x-1.5 duration-100 disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync Directories DB</span>
        </button>
      </div>

      {/* Main Admin tab controls */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left selector col (Span 3) */}
        <div className="md:w-1/4 space-y-1.5">
          {[
            { id: "tools", label: "AI Tools Directory", desc: "Manage indexed AI software models" },
            { id: "internships", label: "Internships Directory", desc: "Add or edit technology internships" },
            { id: "hackathons", label: "Hackathons Directory", desc: "Maintain code events prize pools" },
            { id: "blog", label: "Strategic Hub Blog", desc: "Compose or edit student dynamic advice" },
            { id: "users", label: "Student Log Accounts", desc: "Monitor daily quotas and registers" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full p-3.5 rounded-xl text-left border transition-all duration-150 ${
                activeTab === item.id
                  ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400 font-bold shadow-md"
                  : "bg-slate-900/30 border-slate-900/40 text-slate-400 hover:border-slate-800 hover:text-slate-100"
              }`}
            >
              <span className="text-xs block font-bold tracking-wide uppercase">{item.label}</span>
              <span className="text-[10px] text-slate-500 font-normal block mt-1.5">{item.desc}</span>
            </button>
          ))}
        </div>

        {/* Right workspace panel (Span 9) */}
        <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4 h-full">
          {activeTab === "blog" && editorOpen ? (
            <div>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
                <h3 className="font-display font-bold text-sm tracking-wide text-white uppercase">
                  {editingBlog?.id ? "Edit Strategic Article" : "Compose Strategic Article"}
                </h3>
                <button
                  onClick={() => {
                    setEditorOpen(false);
                    setEditingBlog(null);
                  }}
                  className="px-2.5 py-1 text-[10px] uppercase font-mono font-bold text-slate-400 hover:text-white bg-slate-800 rounded hover:bg-slate-705"
                >
                  Cancel Compose
                </button>
              </div>
              <BlogEditor
                initialPost={editingBlog || {}}
                onSave={handleSaveBlogSubmit}
                onCancel={() => {
                  setEditorOpen(false);
                  setEditingBlog(null);
                }}
              />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                <h3 className="font-display font-bold text-slate-100 text-sm uppercase tracking-wide">
                  Selected: <span className="text-indigo-400">{activeTab}</span> lists
                </h3>
                
                {activeTab !== "users" && (
              <button
                onClick={() => {
                  if (activeTab === "tools") {
                    setEditingTool({
                      name: "",
                      description: "",
                      category: "Chatbots",
                      pricing: "Free",
                      pros: [],
                      cons: [],
                      website_url: "https://"
                    });
                    setToolModalOpen(true);
                  } else if (activeTab === "internships") {
                    setEditingInternship({
                      company: "",
                      role: "",
                      location: "",
                      is_remote: false,
                      stipend: "No Stipend",
                      eligibility: "",
                      deadline: "",
                      apply_url: "https://"
                    });
                    setInternshipModalOpen(true);
                  } else if (activeTab === "hackathons") {
                    setEditingHackathon({
                      name: "",
                      organizer: "",
                      prize_pool: "",
                      deadline: "",
                      eligibility: "",
                      registration_url: "https://"
                    });
                    setHackathonModalOpen(true);
                  } else if (activeTab === "blog") {
                    setEditingBlog({
                      title: "",
                      content: "",
                      excerpt: "",
                      author: currentUser?.name || "Administrator",
                      created_at: new Date().toISOString(),
                      views: 0,
                      likes: 0,
                      category: "Engineering",
                      seo_keywords: ["strategic", "insights", "tech-careers"],
                      is_published: true
                    });
                    setEditorOpen(true);
                  }
                }}
                className="flex items-center space-x-1 rounded-xl bg-indigo-600 hover:bg-indigo-505 px-3 py-1.5 text-xs font-bold text-white shadow-md duration-100"
              >
                <Plus className="h-4 w-4" />
                <span>Add Record Entry</span>
              </button>
            )}
          </div>

          {/* LISTS DISPLAY VIEWS */}
          <div className="overflow-x-auto min-h-[300px]" id="admin-table-viewport">
            
            {/* AI Tools database schema render */}
            {activeTab === "tools" && (
              <div className="space-y-3">
                {tools.map((t) => (
                  <div key={t.id} className="p-3 whitespace-pre-line rounded-xl border border-slate-900 bg-slate-950/40 flex justify-between items-center hover:border-slate-800 transition">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{t.name} <span className="text-[10px] text-slate-500 font-medium">({t.pricing})</span></h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-sm mt-0.5">{t.description}</p>
                      <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider inline-block mt-1 bg-indigo-500/5 px-2 py-0.5 rounded">{t.category}</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingTool(t);
                          setToolModalOpen(true);
                        }}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Edit entry fields"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTool(t.id)}
                        className="p-1 rounded bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Internships schema list render */}
            {activeTab === "internships" && (
              <div className="space-y-3">
                {internships.map((i) => (
                  <div key={i.id} className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 flex justify-between items-center hover:border-slate-800 transition">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{i.role}</h4>
                      <p className="text-[10px] text-indigo-400 font-semibold mt-0.5">{i.company} · {i.location} ({i.is_remote ? "Remote" : "Onsite"})</p>
                      <p className="text-[9px] text-slate-550 block mt-1">Stipend: <strong className="text-emerald-400 font-medium">{i.stipend}</strong> · Deadline: {i.deadline}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingInternship(i);
                          setInternshipModalOpen(true);
                        }}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Edit entry"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteInternship(i.id)}
                        className="p-1 rounded bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hackathons schema lists */}
            {activeTab === "hackathons" && (
              <div className="space-y-3">
                {hackathons.map((h) => (
                  <div key={h.id} className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 flex justify-between items-center hover:border-slate-800 transition">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{h.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">By {h.organizer} · Pool: <span className="text-amber-500 font-semibold">{h.prize_pool}</span></p>
                      <span className="text-[9px] text-slate-500 block mt-1">Due: {h.deadline}</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingHackathon(h);
                          setHackathonModalOpen(true);
                        }}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHackathon(h.id)}
                        className="p-1 rounded bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Users Registered logs render */}
            {activeTab === "users" && (
              <div className="space-y-3">
                {users.map((usr) => (
                  <div key={usr.id} className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <h4 className="text-xs font-bold text-slate-100">{usr.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{usr.email}</p>
                      <p className="text-[9px] text-slate-500 mt-1">ID: {usr.id.slice(0, 10)}... · Joined: {new Date(usr.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        usr.role === "admin" ? "bg-amber-500/20 text-amber-500" : "bg-indigo-500/20 text-indigo-400"
                      }`}>
                        {usr.role === "admin" ? "Admin" : "Student"}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-2 font-mono">Tokens: {usr.daily_prompt_count}/20</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "blog" && (
              <div className="space-y-3">
                {blogs.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 flex justify-between items-center hover:border-slate-800 transition">
                    <div className="min-w-0 flex-1 mr-4">
                      <div className="flex items-center space-x-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${b.is_published ? "bg-emerald-400" : "bg-amber-400"}`} />
                        <h4 className="text-xs font-bold text-slate-100 truncate">{b.title}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 truncate max-w-lg">{b.excerpt || b.content.slice(0, 100)}</p>
                      <div className="flex items-center space-x-2.5 mt-2.5 text-[9px] text-slate-500 font-mono">
                        <span className="font-semibold text-indigo-400">Category: {b.category}</span>
                        <span>·</span>
                        <span>Views: {b.views}</span>
                        <span>·</span>
                        <span>Likes: {b.likes}</span>
                        <span>·</span>
                        <span>{new Date(b.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingBlog(b);
                          setEditorOpen(true);
                        }}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Edit strategic advice"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(b.id)}
                        className="p-1 rounded bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {blogs.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-500">No blog publications registered. Click "Add Record Entry" to get started.</p>
                  </div>
                )}
              </div>
            )}

          </div>

          </>
        )}
      </div></div>

      {/* 1. CHATBOT TOOL CRUD MODAL */}
      {toolModalOpen && editingTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="font-display font-bold text-lg text-white mb-4">
              {editingTool.id ? "Edit AI Tool database record" : "Register a brand new AI Tool"}
            </h3>

            <form onSubmit={handleSaveToolSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Claude 3"
                  value={editingTool.name}
                  onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category</label>
                <select
                  value={editingTool.category}
                  onChange={(e) => setEditingTool({ ...editingTool, category: e.target.value as AIToolCategory })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                >
                  <option value="Chatbots">Chatbots</option>
                  <option value="Coding Assistants">Coding Assistants</option>
                  <option value="Image Gen">Image Gen</option>
                  <option value="Video Gen">Video Gen</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Research">Research</option>
                  <option value="Resume Builders">Resume Builders</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={editingTool.description}
                  onChange={(e) => setEditingTool({ ...editingTool, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Pricing Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Free, Freemium, Paid"
                    value={editingTool.pricing}
                    onChange={(e) => setEditingTool({ ...editingTool, pricing: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Website URL (Website link spec!)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://claud.ai"
                    value={editingTool.website_url}
                    onChange={(e) => setEditingTool({ ...editingTool, website_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setToolModalOpen(false);
                    setEditingTool(null);
                  }}
                  className="rounded-xl border border-slate-805 bg-slate-950 hover:bg-slate-900 text-slate-350 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white px-5 py-2 font-bold"
                >
                  Apply Database Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. INTERNSHIP CRUD MODAL */}
      {internshipModalOpen && editingInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="font-display font-bold text-lg text-white mb-4">
              {editingInternship.id ? "Edit Internship database record" : "Index a brand new Internship"}
            </h3>

            <form onSubmit={handleSaveInternshipSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OpenAI"
                    value={editingInternship.company}
                    onChange={(e) => setEditingInternship({ ...editingInternship, company: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Compiler Engineer"
                    value={editingInternship.role}
                    onChange={(e) => setEditingInternship({ ...editingInternship, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. San Francisco, CA"
                    value={editingInternship.location}
                    onChange={(e) => setEditingInternship({ ...editingInternship, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Stipend Pool</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $8,500 / month"
                    value={editingInternship.stipend}
                    onChange={(e) => setEditingInternship({ ...editingInternship, stipend: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Eligibility details (spec criteria!)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. MS or PhD candidates in computer systems"
                  value={editingInternship.eligibility}
                  onChange={(e) => setEditingInternship({ ...editingInternship, eligibility: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Deadline Date</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oct 30, 2026"
                    value={editingInternship.deadline}
                    onChange={(e) => setEditingInternship({ ...editingInternship, deadline: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-5">
                  <input
                    type="checkbox"
                    id="edit-is-remote"
                    checked={editingInternship.is_remote}
                    onChange={(e) => setEditingInternship({ ...editingInternship, is_remote: e.target.checked })}
                    className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <label htmlFor="edit-is-remote" className="text-xs text-slate-300 font-semibold uppercase">Is Remote</label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Apply URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://openai.com/careers"
                  value={editingInternship.apply_url}
                  onChange={(e) => setEditingInternship({ ...editingInternship, apply_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 p-2.5 text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setInternshipModalOpen(false);
                    setEditingInternship(null);
                  }}
                  className="rounded-xl border border-slate-805 bg-slate-950 hover:bg-slate-900 text-slate-350 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white px-5 py-2 font-bold"
                >
                  Apply Database Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. HACKATHON CRUD MODAL */}
      {hackathonModalOpen && editingHackathon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="font-display font-bold text-lg text-white mb-4">
              {editingHackathon.id ? "Edit Hackathon database record" : "Index a brand new Hackathon"}
            </h3>

            <form onSubmit={handleSaveHackathonSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Event Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anthropic AI Hack"
                    value={editingHackathon.name}
                    onChange={(e) => setEditingHackathon({ ...editingHackathon, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Organizer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anthropic"
                    value={editingHackathon.organizer}
                    onChange={(e) => setEditingHackathon({ ...editingHackathon, organizer: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-955 bg-slate-950 p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Prize Pool</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $50,000 cash"
                    value={editingHackathon.prize_pool}
                    onChange={(e) => setEditingHackathon({ ...editingHackathon, prize_pool: e.target.value })}
                    className="w-full rounded-xl border border-slate-805 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Registration Deadline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nov 14, 2026"
                    value={editingHackathon.deadline}
                    onChange={(e) => setEditingHackathon({ ...editingHackathon, deadline: e.target.value })}
                    className="w-full rounded-xl border border-slate-805 bg-slate-950 p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Eligibility terms (spec criteria!)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Open to registered global university graduate students"
                  value={editingHackathon.eligibility}
                  onChange={(e) => setEditingHackathon({ ...editingHackathon, eligibility: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Registration URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://hackathons.dev/anthropic"
                  value={editingHackathon.registration_url}
                  onChange={(e) => setEditingHackathon({ ...editingHackathon, registration_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-805 bg-slate-950 p-2.5 text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setHackathonModalOpen(false);
                    setEditingHackathon(null);
                  }}
                  className="rounded-xl border border-slate-805 bg-slate-950 hover:bg-slate-900 text-slate-350 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white px-5 py-2 font-bold"
                >
                  Apply Database Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

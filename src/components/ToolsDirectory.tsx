import React, { useState, useEffect } from "react";
import { Search, Heart, ExternalLink, Bookmark, Sparkles, Filter, X, ChevronRight } from "lucide-react";
import { Profile, AITool } from "../types";

interface ToolsDirectoryProps {
  currentUser: Profile | null;
  savedItemIds: string[];
  onToggleSave: (itemType: 'tool' | 'internship' | 'hackathon', itemId: string) => void;
  onOpenLogin: () => void;
}

export default function ToolsDirectory({
  currentUser,
  savedItemIds,
  onToggleSave,
  onOpenLogin,
}: ToolsDirectoryProps) {
  const [tools, setTools] = useState<AITool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);

  useEffect(() => {
    fetchTools();
  }, [selectedCategory, searchQuery]);

  const fetchTools = async () => {
    try {
      const q = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "All") q.append("category", selectedCategory);
      if (searchQuery) q.append("search", searchQuery);

      const res = await fetch(`/api/tools?${q.toString()}`);
      const data = await res.json();
      if (data.tools) {
        setTools(data.tools);
      }
    } catch (err) {
      console.error("Error loading tools directory:", err);
    }
  };

  const categories = [
    "All",
    "Chatbots",
    "Coding Assistants",
    "Image Gen",
    "Video Gen",
    "Productivity",
    "Research",
    "Resume Builders"
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6" id="tools-directory-container">
      
      {/* Page Header text */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">AI Tools Directory</h2>
          <p className="text-xs text-slate-400 mt-1">Discover, search, filter, and save premium developer tools customized for student success.</p>
        </div>
      </div>

      {/* Inputs Search bar & category selection tabs */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          
          {/* Spotlight style Search bar */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by tool name, description, benefits (e.g. Claude)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 py-3.5 pl-11 pr-4 text-xs text-white placeholder-slate-500 hover:border-slate-700/80 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filtering tag */}
          <div className="hidden lg:flex items-center space-x-1 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5 text-indigo-400" />
            <span>Quick Filters</span>
          </div>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-slate-900/40">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 duration-150 border uppercase tracking-wide text-[10px] ${
                selectedCategory === cat
                  ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400 font-bold"
                  : "bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid Layout */}
      {tools.length === 0 ? (
        <div className="text-center py-16 border border-slate-900 rounded-3xl bg-slate-950/20 max-w-md mx-auto relative">
          <Bookmark className="h-8 w-8 mx-auto text-slate-600 opacity-40 mb-3" />
          <h3 className="font-display font-bold text-sm text-slate-300">No AI Tools Located</h3>
          <p className="text-xs text-slate-500 mt-1">Try modifying your query or category filter definitions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" id="tools-masonry-list">
          {tools.map((tool) => {
            const isSaved = savedItemIds.includes(tool.id);
            return (
              <div
                key={tool.id}
                className="relative rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 hover:border-indigo-500/30 duration-300 transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    {/* Category Label badge */}
                    <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                      {tool.category}
                    </span>
                    
                    {/* Bookmarked heart widget */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!currentUser) {
                          onOpenLogin();
                          return;
                        }
                        onToggleSave('tool', tool.id);
                      }}
                      className={`p-1.5 rounded-xl border transition duration-150 cursor-pointer ${
                        isSaved
                          ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-slate-800"
                          : "bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700"
                      }`}
                      title={isSaved ? "Saved to Bookmark Hub" : "Add to Favorites List"}
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? "fill-red-400" : ""}`} />
                    </button>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-100 mt-4 group-hover:text-indigo-400 duration-150">
                    {tool.name}
                  </h3>
                  
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed line-clamp-3">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between">
                  {/* Pricing */}
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    Pricing Mode: <span className="text-slate-300 font-semibold">{tool.pricing}</span>
                  </div>

                  <button
                    onClick={() => setSelectedTool(tool)}
                    className="text-xs text-indigo-400 font-bold hover:text-indigo-300 flex items-center space-x-1"
                  >
                    <span>Quick View Info</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Info Modal View Sheet */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Header section with category */}
            <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                  {selectedTool.category}
                </span>
                <span className="text-slate-500 font-medium text-xs">·</span>
                <span className="text-emerald-400 text-xs font-semibold uppercase">{selectedTool.pricing} Model</span>
              </div>
              <button
                onClick={() => setSelectedTool(null)}
                className="text-slate-400 hover:text-slate-100 font-bold px-2 py-1 hover:bg-slate-800 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            {/* Core details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-extrabold text-xl text-white">{selectedTool.name}</h3>
                <p className="text-slate-300 text-xs leading-relaxed mt-2 p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  {selectedTool.description}
                </p>
              </div>

              {/* Grid for Pros and Cons (fields required by spec!) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pros List card */}
                <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 space-y-2">
                  <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400">Pros & Strengths</h4>
                  {selectedTool.pros && selectedTool.pros.length > 0 ? (
                    <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4 leading-relaxed">
                      {selectedTool.pros.map((pro, index) => (
                        <li key={index}>{pro}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No direct pros indicated yet.</p>
                  )}
                </div>

                {/* Cons List card */}
                <div className="p-4 rounded-xl border border-orange-500/10 bg-orange-500/5 space-y-2">
                  <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-orange-400">Cons & Downside</h4>
                  {selectedTool.cons && selectedTool.cons.length > 0 ? (
                    <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4 leading-relaxed">
                      {selectedTool.cons.map((con, index) => (
                        <li key={index}>{con}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No significant limitations logged.</p>
                  )}
                </div>
              </div>

              {/* Resource action bar link (website link required by spec!) */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (!currentUser) onOpenLogin();
                    else onToggleSave('tool', selectedTool.id);
                  }}
                  className={`flex items-center space-x-1.5 text-xs font-semibold border px-4 py-2 rounded-xl duration-150 ${
                    savedItemIds.includes(selectedTool.id)
                      ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-slate-800"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-300"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${savedItemIds.includes(selectedTool.id) ? "fill-red-400" : ""}`} />
                  <span>
                    {savedItemIds.includes(selectedTool.id) ? "Saved to Bookmark Hub" : "Bookmark Tool"}
                  </span>
                </button>

                <a
                  href={selectedTool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20 px-5 py-2 hover:shadow-md text-xs font-bold text-white flex items-center space-x-1.5 duration-100"
                >
                  <span>Launch website</span>
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

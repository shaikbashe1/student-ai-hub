import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Terminal, MessageSquare, Trash2, Send, Sparkles, 
  ChevronRight, Copy, Check, FileCode, Play, AlertCircle, HelpCircle
} from "lucide-react";
import { Profile, ChatSession, ChatMessage } from "../types";

interface ChatAssistantProps {
  currentUser: Profile | null;
  onOpenLogin: () => void;
  triggerProfileSync: () => void;
}

export default function ChatAssistant({
  currentUser,
  onOpenLogin,
  triggerProfileSync,
}: ChatAssistantProps) {
  // Chat preferences states
  const [selectedLanguage, setSelectedLanguage] = useState("Python");
  const [selectedMode, setSelectedMode] = useState<"Generate" | "Explain" | "Debug" | "Optimize">("Explain");
  
  // Interactive Session States
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("new");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  
  // App Mechanics states
  const [isSending, setIsSending] = useState(false);
  const [isCopiedId, setIsCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync / Refresh chat sessions on user login
  useEffect(() => {
    if (currentUser) {
      fetchSessions();
    } else {
      setSessions([]);
      setMessages([]);
      setCurrentSessionId("new");
    }
  }, [currentUser]);

  // Sync / Refresh messages when session ID shifts
  useEffect(() => {
    if (currentUser && currentSessionId !== "new") {
      fetchMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId, currentUser]);

  // Scroll to bottom helper
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const fetchSessions = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/ai/sessions?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Error loading chat sessions:", err);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/ai/session-messages?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const handleNewConversation = () => {
    setCurrentSessionId("new");
    setMessages([]);
    setErrorMessage(null);
  };

  const handleDeleteSession = async (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/ai/session?sessionId=${sessId}`, { method: "DELETE" });
      if (res.ok) {
        setSessions(sessions.filter((s) => s.id !== sessId));
        if (currentSessionId === sessId) {
          handleNewConversation();
        }
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!currentUser) {
      onOpenLogin();
      return;
    }

    const currentPrompt = inputText;
    setInputText("");
    setIsSending(true);
    setErrorMessage(null);

    // Optimistic local state rendering
    const tempUserMsg: ChatMessage = {
      id: "temp_user_" + Date.now(),
      session_id: currentSessionId,
      role: "user",
      content: currentPrompt,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          sessionId: currentSessionId,
          message: currentPrompt,
          language: selectedLanguage,
          mode: selectedMode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Render systems error alert
        setErrorMessage(data.error || "An unexpected error occurred. Please check assistant limits.");
        // Exclude failed optimistic msg
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        setIsSending(false);
        return;
      }

      // Sync active session if newly created
      if (currentSessionId === "new") {
        setCurrentSessionId(data.sessionId);
        fetchSessions();
      }

      // Append assistant real response 
      const assistantMsgObj: ChatMessage = {
        id: "rply_" + Date.now(),
        session_id: data.sessionId,
        role: "assistant",
        content: data.reply,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id); // remove temp
        return [...filtered, tempUserMsg, assistantMsgObj];
      });

      // Update remaining daily prompts counter
      triggerProfileSync();
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Network error. Encountered connection difficulties with our servers.");
    } finally {
      setIsSending(false);
    }
  };

  // Helper function to format and render markdown code blocks gracefully
  const parseResponseContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : selectedLanguage.toLowerCase();
        const code = match ? match[2] : part.slice(3, -3);
        const blockId = `code_${index}_${Math.random().toString(36).substr(2, 4)}`;

        return (
          <div key={index} className="my-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
            {/* Code Block Header Section */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-900 bg-slate-950/90 text-[10px] font-mono text-slate-400">
              <div className="flex items-center space-x-1.5">
                <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                <span className="uppercase font-semibold tracking-wider text-slate-300">{lang || "code"} block</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setIsCopiedId(blockId);
                  setTimeout(() => setIsCopiedId(null), 2000);
                }}
                className="flex items-center space-x-1 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded px-2 py-0.5"
              >
                {isCopiedId === blockId ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Pre syntax format area */}
            <pre className="p-4 overflow-x-auto text-xs text-slate-200 font-mono leading-relaxed bg-slate-950">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Replace generic inline `code` highlights
      const inlineParts = part.split(/(`[^`]+`)/);
      return (
        <span key={index} className="whitespace-pre-line leading-relaxed text-slate-300">
          {inlineParts.map((inlinePart, subIndex) => {
            if (inlinePart.startsWith("`") && inlinePart.endsWith("`")) {
              return (
                <code key={subIndex} className="px-1.5 py-0.5 rounded bg-slate-900 text-pink-400 text-xs font-mono border border-slate-800">
                  {inlinePart.slice(1, -1)}
                </code>
              );
            }
            return inlinePart;
          })}
        </span>
      );
    });
  };

  const languages = ["Python", "Java", "C++", "TypeScript", "JavaScript", "SQL", "C"];
  const modes = [
    { id: "Generate", label: "Generate Code", desc: "Write whole functions from scratch" },
    { id: "Explain", label: "Explain Code", desc: "Break concepts down step-by-step" },
    { id: "Debug", label: "Fix Bugs", desc: "Locate glitches and rewrite errors" },
    { id: "Optimize", label: "Optimize Runtime", desc: "Boost complexity algorithms" }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6" id="chat-assistant-container">
      
      {/* Rate limit warn / Prompt remaining status banner */}
      {currentUser && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-4 gap-4">
          <div className="flex items-start space-x-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              currentUser.role === "admin" ? "bg-amber-500/10 text-amber-400" : "bg-indigo-500/10 text-indigo-400"
            }`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {currentUser.role === "admin" ? "Injected Administrative Developer Mode Engine" : "Daily Free Educational Quota"}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.role === "admin" 
                  ? "Unlimited processing instructions enabled. Rate-locks bypassed." 
                  : `You are allotted 20 premium AI query prompts per day. Resets 24h.`}
              </p>
            </div>
          </div>
          
          {currentUser.role !== "admin" && (
            <div className="w-full sm:w-auto shrink-0 md:max-w-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Available prompts:</span>
                <span className={`${currentUser.daily_prompt_count <= 3 ? 'text-red-400' : 'text-indigo-400'}`}>
                  {currentUser.daily_prompt_count} / 20 Remaining
                </span>
              </div>
              <div className="h-2 w-full sm:w-48 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${(currentUser.daily_prompt_count / 20) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main split dashboard panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-slate-800 bg-slate-900/20 overflow-hidden min-h-[680px]">
        
        {/* Left Control and Session panel (Span 4) */}
        <div className="md:col-span-4 border-r border-slate-800 flex flex-col bg-slate-950/40 h-full">
          
          {/* New Chat Button */}
          <div className="p-4 border-b border-slate-800/80">
            <button
              onClick={handleNewConversation}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white duration-150 text-xs font-bold text-slate-300 py-3"
              id="new-chat-session-btn"
            >
              <Plus className="h-4 w-4 text-indigo-400" />
              <span>New AI Conversation</span>
            </button>
          </div>

          {/* Prompt Mode Toggles */}
          <div className="p-4 border-b border-slate-800 space-y-3">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">I want to...</p>
            <div className="grid grid-cols-2 gap-2">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMode(m.id as any)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 ${
                    selectedMode === m.id
                      ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold block">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Languages selective panel */}
          <div className="p-4 border-b border-slate-800 space-y-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Primary Programming Language</p>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition duration-150 ${
                    selectedLanguage === lang
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-md"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* User Chat Session lists */}
          <div className="p-4 flex-1 overflow-y-auto space-y-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-3">Conversation Log history</p>
            
            {!currentUser ? (
              <div className="text-center py-6 text-slate-500">
                <HelpCircle className="h-6 w-6 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Sign in to view saved session databases</p>
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Your prompt history is empty. Start typing!</p>
            ) : (
              <div className="space-y-1">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => setCurrentSessionId(sess.id)}
                    className={`flex items-center justify-between group rounded-xl px-3 py-2.5 text-xs text-left cursor-pointer transition duration-150 ${
                      currentSessionId === sess.id
                        ? "bg-indigo-500/10 border-r-2 border-indigo-500 text-indigo-400 font-semibold"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{sess.title}</span>
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 shrink-0 duration-150"
                      title="Delete chat session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Active Chat Console panel (Span 8) */}
        <div className="md:col-span-8 flex flex-col h-[680px] bg-slate-950/10 relative">
          
          {/* Chat Headers bar */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-950/30 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="font-display font-medium text-xs text-slate-300">
                Active Code Sandbox AI Assistant ({selectedMode} mode)
              </span>
            </div>
            
            <div className="text-xs text-slate-500">
              Language context: <strong className="text-indigo-400 font-semibold">{selectedLanguage}</strong>
            </div>
          </div>

          {/* Active messages viewport */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            
            {/* If no auth */}
            {!currentUser && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                  <Terminal className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Access the Coding Assistant</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Student AI Assistant requires authorization to maintain daily limit counts and persist secure session history logs. 
                  </p>
                </div>
                <button
                  onClick={onOpenLogin}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20 px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 duration-100"
                >
                  Authorize Profile Sign In
                </button>
              </div>
            )}

            {/* If signed in but no chat messages */}
            {currentUser && messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 pt-12">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400">
                  <Sparkles className="h-6 w-6 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-100">Welcome To Student AI Coder</h3>
                  <p className="text-xs text-slate-400 mt-1 pb-4 leading-relaxed">
                    Ask me programming questions, request quick code optimization algorithms, debug errors, or explain computer science fundamentals!
                  </p>
                  
                  {/* Quick starting suggestions */}
                  <div className="grid grid-cols-1 gap-2 text-left">
                    {[
                      "Write a Python function to check for primes",
                      "Explain dynamic programming in simple language",
                      "Show me a SQL query to fetch aggregate salaries",
                      "Optimize a nested loop using HashMaps in C++"
                    ].map((sug) => (
                      <button
                        key={sug}
                        onClick={() => setInputText(sug)}
                        className="p-2.5 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-indigo-500/20 text-slate-300 text-xs hover:text-indigo-400 transition"
                      >
                        ⚡ &quot;{sug}&quot;
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages Lists rendering */}
            {currentUser && messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Assistant profile icon */}
                {m.role !== "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}

                <div className={`rounded-2xl p-4 max-w-[85%] text-xs shadow-md leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                    : "bg-slate-900/60 border border-slate-800 text-slate-300 rounded-tl-none font-sans"
                }`}>
                  {m.role === "user" ? (
                    <p className="whitespace-pre-line leading-relaxed text-[12.5px]">{m.content}</p>
                  ) : (
                    <div className="space-y-1 text-[12.5px]">
                      {parseResponseContent(m.content)}
                    </div>
                  )}
                  <p className="text-[9px] text-slate-400 mt-2 text-right opacity-80 font-mono">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Systems server query warnings */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-start space-x-2 px-4 shadow-md">
                <AlertCircle className="h-4.5 w-4.5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-red-400 font-bold text-xs uppercase tracking-wide">Assistant Query Limit Block </p>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* AI thinking state indicator */}
            {isSending && (
              <div className="flex gap-4 justify-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="rounded-2xl p-4 bg-slate-900/40 border border-slate-800 flex items-center space-x-3 shadow-md">
                  <div className="flex space-x-1.5 py-1.5 px-1">
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" />
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-xs text-slate-400 italic">Thinking and typing coding explanations...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Prompt Entry Box */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <form onSubmit={handleSendMessage} className="flex space-x-2.5">
              <input
                type="text"
                disabled={!currentUser || isSending}
                placeholder={
                  !currentUser
                    ? "Authorize sign in to prompt the AI coder..."
                    : isSending
                    ? "Syncing explanations. Please wait..."
                    : `Stuck with a CSCI homework problem? Ask AI coder...`
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40"
              />
              
              <button
                type="submit"
                disabled={!currentUser || isSending || !inputText.trim()}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 flex h-11 w-11 items-center justify-center text-white shrink-0 active:scale-95 duration-150 shadow shadow-indigo-500/10"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

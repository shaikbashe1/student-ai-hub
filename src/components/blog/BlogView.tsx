import React, { useState, useEffect } from "react";
import { BlogPost } from "../../types";
import BlogCard from "./BlogCard";
import RelatedArticles from "./RelatedArticles";
import AdSlot from "../ads/AdSlot";
import JsonLd from "../seo/JsonLd";
import { buildBlogPostJsonLd } from "../../lib/seo/schemas";
import { updateDocumentMetadata } from "../../lib/seo/metadata";
import { track } from "../../lib/analytics";
import { 
  BookOpen, Search, ArrowLeft, Mail, Check, 
  Clock, Eye, Heart, Share2, Sparkles, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BlogViewProps {
  currentUser: any | null;
  onOpenLogin: () => void;
}

export default function BlogView({ currentUser, onOpenLogin }: BlogViewProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  
  // Newsletter Subscribe state
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribedStatus, setSubscribedStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    fetchPosts();
    track("view_blog_directory");
    updateDocumentMetadata({
      title: "Strategic Student Insights Blog",
      description: "Expert advice and roadmaps on finding internships, winning hackathons, and utilizing AI models for software development.",
      keywords: ["colleges", "hackathons", "internships", "careers", "ai", "mentors"]
    });
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/blog");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching blog posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPost = async (post: BlogPost) => {
    setSelectedPost(post);
    track("open_blog_post", { id: post.id, title: post.title, slug: post.slug });
    
    // Dynamically update document title & heads
    updateDocumentMetadata({
      title: post.title,
      description: post.excerpt,
      keywords: post.seo_keywords,
      canonicalUrl: window.location.origin + `/blog/${post.slug}`
    });

    // Request views increment to backend Express proxy
    try {
      fetch(`/api/blog/${post.slug}/view`, { method: "PUT" }).then(res => {
        if (res.ok) {
          // Increment views count locally for instant UI update
          setPosts(prev => prev.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p));
          setSelectedPost(prev => prev ? { ...prev, views: prev.views + 1 } : null);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail.trim() || isSubscribing) return;

    setIsSubscribing(true);
    setSubscribedStatus("idle");
    track("newsletter_subscribe_attempt", { email: subscriberEmail });

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscriberEmail, userName: currentUser?.name || "Subscriber" })
      });

      if (res.ok) {
        setSubscribedStatus("success");
        setSubscriberEmail("");
        track("newsletter_subscribe_success");
        setTimeout(() => setSubscribedStatus("idle"), 5000);
      } else {
        setSubscribedStatus("error");
      }
    } catch (err) {
      console.error("Subscription failed:", err);
      setSubscribedStatus("error");
    } finally {
      setIsSubscribing(false);
    }
  };

  // Filter Categories list
  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category)))];

  const filteredPosts = posts
    .filter(p => p.is_published)
    .filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.seo_keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8" id="student-hub-blog-container">
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: DETAILED POST VIEW */}
        {selectedPost ? (
          <motion.div
            key="detailed-post"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* Inject JSON-LD Rich Schema Tags structurally */}
            <JsonLd schema={buildBlogPostJsonLd(selectedPost, window.location.origin)} id="dynamic-post-ld" />

            {/* Back action controls */}
            <button
              onClick={() => {
                setSelectedPost(null);
                updateDocumentMetadata({
                  title: "Strategic Student Insights Blog",
                  description: "Expert advice and roadmaps on finding internships, winning hackathons, and utilizing AI models for software engineering."
                });
              }}
              className="group text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1.5 duration-100"
              id="back-to-blog-btn"
            >
              <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 duration-150" />
              <span>Back to Directory Listings</span>
            </button>

            {/* Top article heading bar */}
            <header className="space-y-4 pb-6 border-b border-slate-900">
              <span className="rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                {selectedPost.category}
              </span>
              <h1 className="font-display font-black text-2xl text-white sm:text-3.5xl max-w-4xl leading-tight">
                {selectedPost.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs text-slate-400">
                <span>By <strong className="text-white font-semibold">{selectedPost.author}</strong></span>
                <span className="text-slate-700">&bull;</span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                </span>
                <span className="text-slate-700">&bull;</span>
                <span className="flex items-center space-x-1 font-mono">
                  <Eye className="h-4 w-4 text-slate-500" />
                  <span>{selectedPost.views} views</span>
                </span>
              </div>
            </header>

            {/* Article Content Area */}
            <div className="grid gap-8 lg:grid-cols-4">
              
              {/* Content body columns */}
              <div className="lg:col-span-3 space-y-8">
                
                {/* Visual Cover placeholder if no image exists */}
                <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-slate-900 bg-gradient-to-tr from-indigo-950/40 via-slate-950 to-purple-950/40 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent" />
                  <div className="text-center p-4">
                    <BookOpen className="h-10 w-10 text-indigo-500/80 mx-auto animate-pulse" />
                    <p className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-semibold mt-2.5">Platform Intel Library</p>
                  </div>
                </div>

                {/* Excerpt panel */}
                <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-900 leading-relaxed text-slate-350 text-xs italic">
                  <strong>Brief:</strong> {selectedPost.excerpt}
                </div>

                {/* Article core body and sections markdown render */}
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line space-y-4 font-normal prose prose-invert max-w-none">
                  {selectedPost.content}
                </div>

                {/* SEO Keywords tags block */}
                <div className="pt-4 border-t border-slate-900 flex flex-wrap gap-1.5">
                  {selectedPost.seo_keywords.map((k, idx) => (
                    <span 
                      key={idx} 
                      className="rounded border border-slate-800/80 bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-slate-400"
                    >
                      #{k}
                    </span>
                  ))}
                </div>

                {/* Shared Suggestion Widget */}
                <RelatedArticles 
                  currentPost={selectedPost} 
                  allPosts={posts} 
                  onSelectPost={handleSelectPost} 
                />

              </div>

              {/* Sidebar Sponsor columns */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 space-y-4">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-indigo-400 font-mono">Article Details</h4>
                  <div className="space-y-2.5 text-[11px] text-slate-400">
                    <p>Status: <span className="text-emerald-400 font-bold uppercase font-mono">Published</span></p>
                    <p>Intel Category: <span className="text-white font-medium">{selectedPost.category}</span></p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Article URL copied to your clipboard!");
                      }}
                      className="w-full text-center hover:bg-slate-900 border border-slate-800 rounded-xl py-2 flex items-center justify-center space-x-1 text-xs font-semibold text-slate-300"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share Article</span>
                    </button>
                  </div>
                </div>

                {/* Google AdSense container in sidebar */}
                <AdSlot slotId="sidebar-ads" className="w-full" />
              </div>

            </div>

          </motion.div>
        ) : (
          
          /* VIEW 2: ALL DIRECTORIES LISTING */
          <motion.div
            key="directory-listing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            
            {/* Header branding block */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-900 pb-5 gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-indigo-400 font-bold bg-indigo-400/5 px-2.5 py-0.5 rounded tracking-widest">
                  Strategic Student Intel
                </span>
                <h1 className="font-display text-2xl font-black tracking-tight text-white sm:text-3xl mt-1.5 flex items-center gap-1.5">
                  <BookOpen className="h-7 w-7 text-indigo-500" />
                  <span>Platform Intel Blog</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">Written by career advisors, mentors, and engineers to supercharge your tech roadmap.</p>
              </div>

              {/* Subscriptions blocks */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl max-w-sm w-full font-sans">
                <form onSubmit={handleNewsletterSubscribe} className="space-y-2">
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold">
                    <Mail className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Get weekly internship digests & alerts</span>
                  </div>
                  
                  <div className="flex gap-1.5">
                    <input
                      type="email"
                      required
                      placeholder="Enter student email..."
                      value={subscriberEmail}
                      onChange={(e) => setSubscriberEmail(e.target.value)}
                      className="flex-grow rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0 flex items-center justify-center cursor-pointer transition disabled:opacity-40"
                    >
                      {isSubscribing ? "..." : "Join"}
                    </button>
                  </div>

                  {subscribedStatus === "success" && (
                    <div className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                      <Check className="h-3 w-3" />
                      <span>Subscribed! Check simulation logs.</span>
                    </div>
                  )}
                  {subscribedStatus === "error" && (
                    <div className="text-[10px] text-red-400 font-semibold flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Failed to subscribe. Try again.</span>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Middle controls: Searching & Categories filter bars */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/20 p-2 border border-slate-900 rounded-2xl">
              
              {/* Category selections */}
              <div className="flex flex-wrap gap-1 md:w-3/4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      track("filter_blog_category", { category: cat });
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold duration-150 ${
                      selectedCategory === cat
                        ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                        : "text-slate-400 hover:bg-slate-900 border border-transparent"
                    }`}
                  >
                    {cat === "All" ? "All Reading" : cat}
                  </button>
                ))}
              </div>

              {/* Search input field */}
              <div className="relative w-full md:w-1/4 shrink-0">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search articles & keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            {/* Sponsor banner Ad slot */}
            <AdSlot slotId="directory-ad-top" className="mb-6" />

            {/* Blog Posts Listing Grid */}
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border border-indigo-500 border-t-transparent" />
                <span className="text-[10px] text-slate-500 font-mono">Digging up active publications...</span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-slate-900 p-12 text-center max-w-sm mx-auto space-y-2">
                <BookOpen className="h-8 w-8 text-slate-500 mx-auto" />
                <h4 className="font-display font-bold text-white text-sm">No Publications Found</h4>
                <p className="text-xs text-slate-400">We couldn't locate any matching strategic student blogs. Adjust search keyword filters.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" id="posts-listing-viewport-grid">
                {filteredPosts.map(post => (
                  <BlogCard 
                    key={post.id}
                    post={post}
                    onClick={handleSelectPost}
                  />
                ))}
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

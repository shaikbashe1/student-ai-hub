import React, { useState } from "react";
import { BlogPost } from "../../types";
import { Heading, Bold, Italic, List, Code, Quote, Eye } from "lucide-react";

interface BlogEditorProps {
  initialPost?: Partial<BlogPost>;
  onSave: (post: Partial<BlogPost>) => void;
  onCancel: () => void;
}

export default function BlogEditor({ initialPost, onSave, onCancel }: BlogEditorProps) {
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [category, setCategory] = useState(initialPost?.category || "Technology");
  const [keywordsInput, setKeywordsInput] = useState(initialPost?.seo_keywords?.join(", ") || "");
  const [isPublished, setIsPublished] = useState(initialPost?.is_published ?? true);
  const [author, setAuthor] = useState(initialPost?.author || "Administrator");
  const [showPreview, setShowPreview] = useState(false);

  // Generate URL Slug from title input automatically
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialPost?.id) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .substring(0, 50)
      );
    }
  };

  const handleFormat = (type: "h2" | "bold" | "italic" | "list" | "code" | "quote") => {
    const textarea = document.getElementById("editor-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = "";
    switch (type) {
      case "h2":
        replacement = `\n## ${selected || "Header"}\n`;
        break;
      case "bold":
        replacement = `**${selected || "bold text"}**`;
        break;
      case "italic":
        replacement = `*${selected || "italic text"}*`;
        break;
      case "list":
        replacement = `\n- ${selected || "list item"}\n`;
        break;
      case "code":
        replacement = `\`${selected || "code"}\``;
        break;
      case "quote":
        replacement = `\n> ${selected || "blockquote"}\n`;
        break;
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    
    // Focus back on text area
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) return;

    const keywords = keywordsInput
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0);

    onSave({
      ...initialPost,
      title: title.trim(),
      slug: slug.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || content.substring(0, 150).replace(/[#*`>]/g, "") + "...",
      category: category.trim(),
      seo_keywords: keywords,
      is_published: isPublished,
      author: author.trim()
    });
  };

  return (
    <div className="space-y-6" id="blog-editor-wrapper">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <h3 className="font-display font-bold text-sm text-slate-100 uppercase tracking-widest">
          {initialPost?.id ? "Update Blog Publication" : "Compose Strategic Student Insights"}
        </h3>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center space-x-1.5"
        >
          <Eye className="h-4 w-4" />
          <span>{showPreview ? "Focus Editor UI" : "Toggle Publication Layout"}</span>
        </button>
      </div>

      {showPreview ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
              Category: {category}
            </span>
            <h1 className="font-display font-extrabold text-2xl text-white mt-3">{title || "Untitled Strategic Article"}</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Written by: <strong className="text-indigo-400">{author}</strong> &bull; Slug: <span className="font-mono text-slate-500">/blog/{slug || "slug-url"}</span></p>
          </div>
          <p className="text-xs text-slate-300 italic font-medium bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">Excerpt Context: {excerpt || "No excerpt drafted yet."}</p>
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line prose prose-invert font-sans py-4">
            {content || "No body content written yet."}
          </div>
          <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-1.5">
            {keywordsInput.split(",").map((k, idx) => k.trim() && (
              <span key={idx} className="bg-slate-900 text-slate-400 border border-slate-800/80 rounded px-2 py-0.5 font-mono text-[9px]">#{k.trim()}</span>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Post Title</label>
              <input
                type="text"
                required
                placeholder="e.g. How to Win Your First Hackathon (2026 Hack Guide)"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">URL Slug Identifier</label>
              <input
                type="text"
                required
                placeholder="e.g. hackathon-winning-tips-2026"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                className="w-full rounded-xl border border-slate-805 bg-slate-950 px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
              >
                <option value="Internships">Internships Guide</option>
                <option value="Hackathons">Hackathons Guide</option>
                <option value="AI Tools">AI tools reviews</option>
                <option value="Engineering">Software Engineering</option>
                <option value="College Life">College & Careers</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Author Signature</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">SEO Keywords (Comma Separated)</label>
              <input
                type="text"
                placeholder="e.g. hackathon, developers, student, tips"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Concise Excerpt (Summarized context)</label>
            <input
              type="text"
              placeholder="e.g. An actionable framework detailing the assembly of hackathon vectors, design scoping, and pitch guidelines."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Content Canvas (Markdown Support)</label>
              
              {/* Rich editor formats block */}
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5" id="editor-quickbar">
                <button type="button" onClick={() => handleFormat("h2")} className="p-1 hover:bg-slate-800 text-slate-400 rounded" title="Heading H2"><Heading className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => handleFormat("bold")} className="p-1 hover:bg-slate-800 text-slate-400 rounded" title="Bold"><Bold className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => handleFormat("italic")} className="p-1 hover:bg-slate-800 text-slate-400 rounded" title="Italics"><Italic className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => handleFormat("list")} className="p-1 hover:bg-slate-800 text-slate-400 rounded" title="Bullet List"><List className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => handleFormat("code")} className="p-1 hover:bg-slate-800 text-slate-400 rounded" title="Code"><Code className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => handleFormat("quote")} className="p-1 hover:bg-slate-800 text-slate-400 rounded" title="Blockquote"><Quote className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            
            <textarea
              id="editor-textarea"
              required
              rows={12}
              placeholder="Draft your professional insights here. Use formatting buttons above to auto-wrap selected texts."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-white font-sans leading-relaxed focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/30 p-3 border border-slate-900 rounded-xl">
            <input
              type="checkbox"
              id="is-published-tgl"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:outline-none h-4 w-4"
            />
            <label htmlFor="is-published-tgl" className="font-semibold text-slate-300">
              Publish Post (Make immediately visible to students and index inside RSS/Sitemap feeds)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-900 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white px-5 py-2 font-bold shadow-lg"
            >
              Apply Publication State
            </button>
          </div>

        </form>
      )}
    </div>
  );
}

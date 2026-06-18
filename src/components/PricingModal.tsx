import React, { useState } from "react";
import { CreditCard, CheckCircle, Sparkles, Zap, Crown, ArrowRight, X, Loader2 } from "lucide-react";

interface Plan {
  id: "free" | "pro" | "premium";
  name: string;
  price: number;
  period: string;
  badge?: string;
  color: string;
  features: string[];
  limits: string;
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: "free", name: "Free", price: 0, period: "forever", color: "slate",
    limits: "20 AI prompts/day",
    cta: "Current Plan",
    features: [
      "20 AI coding prompts/day",
      "Browse all internship listings",
      "Browse all hackathon listings",
      "Access AI Tools directory",
      "Read blog articles",
      "Basic bookmarks (up to 10)",
    ],
  },
  {
    id: "pro", name: "Pro", price: 9, period: "month", badge: "Most Popular", color: "indigo",
    limits: "200 AI prompts/day",
    cta: "Upgrade to Pro",
    features: [
      "200 AI coding prompts/day",
      "AI Resume Analyzer",
      "AI Roadmap Generator",
      "AI Mock Interview (5/month)",
      "Online Code Compiler",
      "Unlimited bookmarks",
      "AI Study Planner",
      "Priority support",
    ],
  },
  {
    id: "premium", name: "Premium", price: 29, period: "month", badge: "Best Value", color: "amber",
    limits: "Unlimited AI usage",
    cta: "Go Premium",
    features: [
      "Unlimited AI prompts",
      "Unlimited Mock Interviews",
      "AI Project Generator",
      "AI Research Assistant",
      "Live job feed with AI matching",
      "Certificate generation",
      "API access (100k calls/mo)",
      "Admin analytics dashboard",
      "Priority 24h support",
    ],
  },
];

const COLOR_MAP: Record<string, { badge: string; btn: string; ring: string; border: string }> = {
  slate:  { badge: "bg-slate-800 text-slate-400", btn: "bg-slate-800 text-slate-400 cursor-default", ring: "ring-slate-700", border: "border-slate-800" },
  indigo: { badge: "bg-indigo-500/15 text-indigo-400", btn: "bg-indigo-600 hover:bg-indigo-500 text-white", ring: "ring-indigo-500/30", border: "border-indigo-500/30" },
  amber:  { badge: "bg-amber-500/15 text-amber-400", btn: "bg-amber-600 hover:bg-amber-500 text-white", ring: "ring-amber-500/30", border: "border-amber-500/30" },
};

export default function PricingModal({
  currentUser,
  currentPlan = "free",
  onClose,
  onOpenLogin,
}: {
  currentUser: any;
  currentPlan?: string;
  onClose: () => void;
  onOpenLogin: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [annual, setAnnual]   = useState(false);
  const [error, setError]     = useState("");

  const subscribe = async (planId: string) => {
    if (!currentUser) { onClose(); onOpenLogin(); return; }
    if (planId === "free" || planId === currentPlan) return;
    setLoading(planId); setError("");
    try {
      const res = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, plan: planId, annual }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="pricing-title">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50 overflow-hidden max-h-[92vh] overflow-y-auto">

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-slate-500 hover:text-white transition" aria-label="Close pricing">
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-10 pb-6 text-center border-b border-slate-900">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400 mb-3">
            <Crown className="h-3.5 w-3.5" /><span>Student AI Hub Plans</span>
          </div>
          <h2 id="pricing-title" className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Unlock Your Full Potential
          </h2>
          <p className="text-slate-400 text-sm mt-2">Choose the plan that matches your ambition.</p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center space-x-3 mt-4">
            <span className={`text-sm ${!annual ? "text-white font-semibold" : "text-slate-500"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(v => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${annual ? "bg-indigo-600" : "bg-slate-800"}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${annual ? "translate-x-5" : ""}`} />
            </button>
            <span className={`text-sm ${annual ? "text-white font-semibold" : "text-slate-500"}`}>
              Annual <span className="text-emerald-400 font-bold text-xs ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6">
          {PLANS.map((plan) => {
            const colors = COLOR_MAP[plan.color];
            const price = annual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price;
            const isCurrent = currentPlan === plan.id;
            return (
              <div key={plan.id}
                className={`relative rounded-2xl border p-6 space-y-5 transition ${isCurrent || plan.id === "pro" ? `${colors.border} ring-1 ${colors.ring}` : "border-slate-800"}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${colors.badge}`}>
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-2">
                    {plan.id === "premium" ? <Crown className="h-4 w-4 text-amber-400" /> :
                     plan.id === "pro" ? <Zap className="h-4 w-4 text-indigo-400" /> :
                     <Sparkles className="h-4 w-4 text-slate-400" />}
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  </div>
                  <div className="mt-3 flex items-end space-x-1">
                    <span className="text-3xl font-black text-white">
                      {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {price > 0 && <span className="text-slate-500 text-sm mb-1">/{annual ? "mo (billed annually)" : "month"}</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{plan.limits}</p>
                </div>

                <ul className="space-y-2.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start space-x-2.5 text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => subscribe(plan.id)}
                  disabled={!!loading || isCurrent || plan.id === "free"}
                  className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 disabled:cursor-not-allowed ${colors.btn} ${isCurrent ? "opacity-60" : ""}`}
                >
                  {loading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  <span>{isCurrent ? "Current Plan" : plan.cta}</span>
                </button>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mx-6 mb-4 flex items-center space-x-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <X className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <p className="text-center text-[11px] text-slate-600 pb-6">
          🔒 Payments secured by Stripe · Cancel anytime · 7-day money-back guarantee
        </p>
      </div>
    </div>
  );
}

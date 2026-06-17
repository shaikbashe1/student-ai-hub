import React, { useState } from 'react';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createCheckoutSession, STRIPE_PRICE_IDS } from '../../lib/stripe';
import { PLAN_LIMITS } from '../../types';

export default function PricingPage() {
  const { user, profile } = useAuth();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const subscribe = async (plan: 'pro' | 'premium') => {
    if (!user) return;
    setLoading(plan);
    try {
      const key = `${plan}_${billing}` as keyof typeof STRIPE_PRICE_IDS;
      const priceId = STRIPE_PRICE_IDS[key] ?? '';
      if (priceId) await createCheckoutSession(priceId, user.id, user.email ?? '');
    } catch { /* handled in lib */ }
    finally { setLoading(null); }
  };

  const PLANS = [
    { key: 'free' as const, name: 'Free', monthly: 0, yearly: 0, icon: Sparkles, color: 'text-slate-400', border: 'border-slate-800', btn: 'bg-slate-800 text-slate-300 hover:bg-slate-700', desc: 'Get started for free' },
    { key: 'pro' as const, name: 'Pro', monthly: 9, yearly: 79, icon: Zap, color: 'text-indigo-400', border: 'border-indigo-500/30 ring-1 ring-indigo-500/20', btn: 'bg-indigo-600 text-white hover:bg-indigo-500', desc: 'For serious students', badge: 'Most Popular' },
    { key: 'premium' as const, name: 'Premium', monthly: 19, yearly: 149, icon: Crown, color: 'text-amber-400', border: 'border-amber-500/20', btn: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white', desc: 'For power users' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Simple, Transparent Pricing</h1>
        <p className="mt-2 text-slate-400">Upgrade anytime. Cancel anytime.</p>
        <div className="mt-5 inline-flex items-center rounded-xl border border-slate-700 bg-slate-900 p-1 gap-1">
          <button onClick={() => setBilling('monthly')} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${billing === 'monthly' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>Monthly</button>
          <button onClick={() => setBilling('yearly')} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
            Yearly <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-semibold">Save 30%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const price = billing === 'monthly' ? plan.monthly : plan.yearly;
          const isCurrent = profile?.plan === plan.key;
          return (
            <div key={plan.key} className={`relative rounded-2xl border bg-slate-900 p-6 flex flex-col gap-5 ${plan.border}`}>
              {'badge' in plan && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-[11px] font-bold text-white">{plan.badge}</div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-5 w-5 ${plan.color}`} />
                  <span className="text-base font-bold text-white">{plan.name}</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">${price}</span>
                  {price > 0 && <span className="text-sm text-slate-400 mb-1">/{billing === 'monthly' ? 'mo' : 'yr'}</span>}
                </div>
                <p className="mt-1 text-xs text-slate-500">{plan.desc}</p>
              </div>
              <ul className="space-y-2 flex-1">
                {PLAN_LIMITS[plan.key].features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-400" />{f}
                  </li>
                ))}
              </ul>
              <button disabled={isCurrent || plan.key === 'free' || loading !== null}
                onClick={() => plan.key !== 'free' && void subscribe(plan.key)}
                className={`w-full rounded-xl py-2.5 text-sm font-bold transition disabled:opacity-50 ${plan.btn}`}>
                {isCurrent ? 'Current Plan' : plan.key === 'free' ? 'Get Started Free' : loading === plan.key ? 'Loading...' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
      {!user && <p className="text-center text-sm text-slate-500">Sign in to upgrade your plan.</p>}
    </div>
  );
}

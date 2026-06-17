import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Chrome, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type AuthView = 'login' | 'register' | 'forgot';
interface Props { onClose: () => void }

export default function AuthModal({ onClose }: Props) {
  const { loginWithGoogle, loginWithEmail, register, sendPasswordReset, error, loading, clearError } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [showPw, setShowPw] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setForm((p) => ({ ...p, [f]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'login') { await loginWithEmail(form.email, form.password); onClose(); }
    else if (view === 'register') { await register(form.email, form.password, form.name); onClose(); }
    else { await sendPasswordReset(form.email); setResetSent(true); }
  };

  const handleGoogle = async () => { await loginWithGoogle(); onClose(); };

  const inputCls = "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {view === 'login' ? 'Welcome back' : view === 'register' ? 'Create account' : 'Reset password'}
              </h2>
              <p className="text-xs text-slate-500">Student AI Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
          {view === 'forgot' && resetSent && (
            <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              <CheckCircle className="h-4 w-4" /> Reset link sent! Check your inbox.
            </div>
          )}

          {view !== 'forgot' && (
            <button type="button" onClick={handleGoogle} disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition disabled:opacity-50">
              <Chrome className="h-5 w-5 text-blue-400" /> Continue with Google
            </button>
          )}
          {view !== 'forgot' && (
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="flex-1 border-t border-slate-800" /><span>or with email</span><div className="flex-1 border-t border-slate-800" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {view === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input type="text" required placeholder="Your full name" value={form.name} onChange={set('name')} className={`${inputCls} pl-10`} />
                </div>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type="email" required placeholder="you@university.edu" value={form.email} onChange={set('email')} className={`${inputCls} pl-10`} />
              </div>
            </div>
            {view !== 'forgot' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input type={showPw ? 'text' : 'password'} required minLength={8} placeholder="Min. 8 characters"
                    value={form.password} onChange={set('password')} className={`${inputCls} pl-10 pr-10`} />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {view === 'login' && (
                  <button type="button" onClick={() => setView('forgot')} className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 float-right">
                    Forgot password?
                  </button>
                )}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Processing...
                </span>
              ) : view === 'login' ? 'Sign In' : view === 'register' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            {view === 'login' ? (
              <>No account? <button onClick={() => setView('register')} className="text-indigo-400 hover:text-indigo-300 font-semibold">Sign up free</button></>
            ) : (
              <button onClick={() => setView('login')} className="flex items-center gap-1 mx-auto text-indigo-400 hover:text-indigo-300">
                <ArrowLeft className="h-3 w-3" /> Back to sign in
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

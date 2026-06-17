import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, SubscriptionPlan } from '../../types';
import AuthModal from './AuthModal';

interface Props {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRoles?: UserRole[];
  requirePlan?: SubscriptionPlan[];
}

export default function ProtectedRoute({ children, requireAuth = true, requireRoles, requirePlan }: Props) {
  const { user, profile, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
    </div>
  );

  if (requireAuth && !user) return (
    <>
      <div className="flex flex-col items-center justify-center gap-5 py-24 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
          <Lock className="h-8 w-8" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">Sign in required</h3>
          <p className="mt-2 text-sm text-slate-400">Create a free account to access this feature.</p>
        </div>
        <button onClick={() => setShowAuth(true)}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition">
          Sign In / Sign Up
        </button>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );

  if (requireRoles && profile && !requireRoles.includes(profile.role)) return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
      <div className="text-4xl">🚫</div>
      <h3 className="text-xl font-bold text-white">Access Denied</h3>
      <p className="text-sm text-slate-400">Requires {requireRoles.join(' or ')} role.</p>
    </div>
  );

  if (requirePlan && profile && !requirePlan.includes(profile.plan)) return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 px-4 text-center">
      <div className="text-3xl">⭐</div>
      <h3 className="text-xl font-bold text-white">Upgrade Required</h3>
      <p className="text-sm text-slate-400">
        This feature requires a {requirePlan.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' or ')} plan.
      </p>
    </div>
  );

  return <>{children}</>;
}

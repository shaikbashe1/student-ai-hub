import React from 'react';
import { ShieldAlert, Users, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPanel() {
  const { profile } = useAuth();
  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-400">You need admin privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-7 w-7 text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-slate-400">System overview and management</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: '—', icon: Users, color: 'text-indigo-400' },
          { label: 'Active Today', value: '—', icon: Activity, color: 'text-emerald-400' },
          { label: 'AI Requests Today', value: '—', icon: ShieldAlert, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <s.icon className={`h-5 w-5 mb-2 ${s.color}`} />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <h3 className="text-sm font-semibold text-amber-400 mb-2">Admin Instructions</h3>
        <ul className="space-y-1.5 text-sm text-slate-400">
          <li>• To grant admin role: set <code className="text-slate-300 bg-slate-800 px-1 rounded">users/[uid].role = &apos;admin&apos;</code> directly in Firestore Console</li>
          <li>• To manage subscriptions: use the Stripe Dashboard</li>
          <li>• To view logs: check Firebase Console → Firestore → audit_logs collection</li>
          <li>• To deploy rules: <code className="text-slate-300 bg-slate-800 px-1 rounded">firebase deploy --only firestore</code></li>
        </ul>
      </div>
    </div>
  );
}

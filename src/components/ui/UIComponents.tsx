import React from "react";

interface ErrorBoundaryState { hasError: boolean; error?: Error; }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[300px] px-6 py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-base font-bold text-white mb-2">Something went wrong</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-xs">
            {this.state.error?.message || "An unexpected error occurred in this section."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Skeleton components ──────────────────────────────────────────────────────

const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-800/60 ${className}`} />
);

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5 space-y-4">
      <div className="flex items-center space-x-3">
        <Shimmer className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-3.5 w-2/3" />
          <Shimmer className="h-2.5 w-1/3" />
        </div>
      </div>
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-5/6" />
      <Shimmer className="h-3 w-4/6" />
      <div className="flex space-x-2 pt-1">
        <Shimmer className="h-5 w-16 rounded-full" />
        <Shimmer className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 rounded-xl border border-slate-800/60 bg-slate-900/20">
          <Shimmer className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-3 w-3/4" />
            <Shimmer className="h-2.5 w-1/2" />
          </div>
          <Shimmer className="h-8 w-20 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5 space-y-3">
            <Shimmer className="h-8 w-8 rounded-xl" />
            <Shimmer className="h-6 w-1/2" />
            <Shimmer className="h-3 w-2/3" />
          </div>
        ))}
      </div>
      <ListSkeleton count={4} />
    </div>
  );
}

// ── Empty state component ────────────────────────────────────────────────────

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-6">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── Toast notification ───────────────────────────────────────────────────────

export function Toast({
  message,
  type = "success",
  onClose,
}: {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    error:   "bg-red-500/10 border-red-500/20 text-red-400",
    info:    "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  };

  return (
    <div className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center space-x-2.5 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md text-sm font-medium ${colors[type]}`}>
      <span>{type === "success" ? "✓" : type === "error" ? "✗" : "ℹ"}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition text-current">✕</button>
    </div>
  );
}

// ── Plan badge ───────────────────────────────────────────────────────────────

export function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    free:    "bg-slate-800 text-slate-400",
    pro:     "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
    premium: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${styles[plan] ?? styles.free}`}>
      {plan === "premium" ? "⭐ " : plan === "pro" ? "🚀 " : ""}{plan}
    </span>
  );
}

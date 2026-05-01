import type { ReactNode } from 'react';

type PanelCardProps = {
  title: string;
  actionLabel?: string;
  children?: ReactNode;
};

function PanelCard({ title, actionLabel = 'Ver todo', children }: PanelCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-900">{title}</h4>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        >
          {actionLabel}
        </button>
      </div>

      {children ? (
        children
      ) : (
        <div className="space-y-3">
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        </div>
      )}
    </section>
  );
}

export default PanelCard;

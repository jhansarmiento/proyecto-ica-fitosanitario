type KpiCardProps = {
  title: string;
  value: string;
  subtitle: string;
  accent: 'red' | 'green' | 'blue' | 'orange';
  trend?: string;
};

const accentMap: Record<KpiCardProps['accent'], { border: string; soft: string; icon: string }> = {
  red: { border: 'from-rose-500 to-red-500', soft: 'bg-rose-500/10 text-rose-600', icon: '⚑' },
  green: { border: 'from-emerald-500 to-green-500', soft: 'bg-emerald-500/10 text-emerald-700', icon: '◉' },
  blue: { border: 'from-blue-500 to-cyan-500', soft: 'bg-blue-500/10 text-blue-700', icon: '⌁' },
  orange: { border: 'from-orange-500 to-amber-500', soft: 'bg-orange-500/10 text-orange-700', icon: '⚠' },
};

function KpiCard({ title, value, subtitle, accent, trend = '+4.2%' }: KpiCardProps) {
  const token = accentMap[accent];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${token.border}`} />
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <span className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-bold ${token.soft}`}>{token.icon}</span>
      </div>
      <h3 className="text-4xl font-extrabold leading-none text-slate-900">{value}</h3>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{subtitle}</p>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{trend}</span>
      </div>
    </article>
  );
}

export default KpiCard;

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
}

export default function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold text-slate-900">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </article>
  );
}

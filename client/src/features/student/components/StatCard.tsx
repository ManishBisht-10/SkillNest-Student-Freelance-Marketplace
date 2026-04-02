interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
}

export default function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-secondary/70 bg-secondary/30 p-4">
      <p className="text-xs uppercase tracking-wide text-text/60">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold text-white">{value}</p>
      {helper ? <p className="mt-1 text-xs text-text/60">{helper}</p> : null}
    </article>
  );
}

interface EmptyStateProps {
  title: string;
  subtitle: string;
}

export default function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-secondary/70 bg-secondary/10 px-6 py-8 text-center">
      <h3 className="font-heading text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-text/70">{subtitle}</p>
    </div>
  );
}

export default function AdminPageSkeleton() {
  return (
    <div className="grid animate-pulse gap-3">
      <div className="h-28 rounded-3xl border border-secondary/70 bg-secondary/30" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="h-24 rounded-2xl border border-secondary/70 bg-secondary/20" />
        <div className="h-24 rounded-2xl border border-secondary/70 bg-secondary/20" />
        <div className="h-24 rounded-2xl border border-secondary/70 bg-secondary/20" />
        <div className="h-24 rounded-2xl border border-secondary/70 bg-secondary/20" />
      </div>
      <div className="h-24 rounded-2xl border border-secondary/70 bg-secondary/20" />
      <div className="h-24 rounded-2xl border border-secondary/70 bg-secondary/20" />
    </div>
  );
}

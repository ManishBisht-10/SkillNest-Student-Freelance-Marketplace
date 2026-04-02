import { useEffect, useState } from "react";
import { toast } from "sonner";

import StatCard from "../../student/components/StatCard";
import { getAdminDashboardStats } from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type { AdminDashboardStats } from "../types/admin";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getAdminDashboardStats();
        setStats(response);
      } catch {
        toast.error("Unable to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading || !stats) return <AdminPageSkeleton />;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-text/70">Platform health and KPI summary.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={String(stats.totalUsers)} helper={`Students ${stats.usersByRole.student}, Consumers ${stats.usersByRole.consumer}`} />
        <StatCard label="Total Jobs" value={String(stats.totalJobs)} helper="All statuses" />
        <StatCard label="Active Contracts" value={String(stats.activeContracts)} helper="Currently running" />
        <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} helper="Captured payments" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Disputes" value={String(stats.disputes)} helper="Needs admin attention" />
        <StatCard label="New Signups Today" value={String(stats.newSignupsToday)} helper="Daily growth" />
      </section>
    </div>
  );
}

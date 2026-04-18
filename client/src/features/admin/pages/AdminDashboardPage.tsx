import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Activity, AlertTriangle, Database, IndianRupee, UserPlus, Users } from "lucide-react";

import {
  getAdminDashboardStats,
  listAdminContracts,
  listAdminDisputes,
  listAdminJobs,
  listAdminReviews,
  listAdminTransactions,
  listAdminUsers,
} from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type {
  AdminContract,
  AdminDashboardStats,
  AdminJob,
  AdminReview,
  AdminTransaction,
  AdminUser,
} from "../types/admin";

type Snapshot = {
  stats: AdminDashboardStats;
  users: AdminUser[];
  jobs: AdminJob[];
  contracts: AdminContract[];
  disputes: AdminContract[];
  transactions: AdminTransaction[];
  reviews: AdminReview[];
};

type ActivityItem = {
  id: string;
  label: string;
  detail: string;
  at: string;
};

function toRelativeDate(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
}

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function calcCollectionVolume(items: Array<{ createdAt: string }>, days: number) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter((item) => new Date(item.createdAt).getTime() >= threshold).length;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [stats, users, jobs, contracts, disputes, transactions, reviews] = await Promise.all([
          getAdminDashboardStats(),
          listAdminUsers(),
          listAdminJobs(),
          listAdminContracts(),
          listAdminDisputes(),
          listAdminTransactions(),
          listAdminReviews(),
        ]);

        setSnapshot({
          stats,
          users,
          jobs,
          contracts,
          disputes,
          transactions,
          reviews,
        });
        setLastUpdated(new Date().toLocaleTimeString());
      } catch {
        toast.error("Unable to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading || !snapshot) return <AdminPageSkeleton />;

  const { stats, users, jobs, contracts, disputes, transactions, reviews } = snapshot;

  const activeUsers = users.filter((user) => user.isActive && !user.isBanned).length;
  const pendingVerifications = users.filter((user) => !user.isVerified).length;
  const jobOpen = jobs.filter((job) => job.status === "open").length;
  const jobDisputed = jobs.filter((job) => job.status === "disputed").length;
  const contractHeld = contracts.filter((contract) => contract.paymentStatus === "held").length;

  const recentActivity: ActivityItem[] = [
    ...users.slice(0, 4).map((user) => ({
      id: `u-${user._id}`,
      label: "User joined",
      detail: `${user.name} (${user.role})`,
      at: user.createdAt,
    })),
    ...jobs.slice(0, 4).map((job) => ({
      id: `j-${job._id}`,
      label: "Job created",
      detail: `${job.title} • ${job.status}`,
      at: job.createdAt,
    })),
    ...transactions.slice(0, 4).map((transaction) => ({
      id: `t-${transaction._id}`,
      label: "Payment update",
      detail: `${transaction.type.toUpperCase()} ${money(transaction.amount)}`,
      at: transaction.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(145deg,rgba(37,99,235,0.08),rgba(255,255,255,0.95))] p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Operations Console</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-slate-900">Platform Command Center</h1>
            <p className="mt-1 text-sm text-slate-600">Central observability across user growth, marketplace supply, and payment integrity.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
            Last refresh: <span className="font-semibold text-slate-900">{lastUpdated}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Users</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-3xl font-bold text-slate-900"><Users size={20} /> {stats.totalUsers}</p>
          <p className="mt-1 text-xs text-slate-500">{activeUsers} active, {pendingVerifications} pending verification</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Revenue</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-3xl font-bold text-slate-900"><IndianRupee size={20} /> {stats.totalRevenue.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-slate-500">Completed payment capture volume</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Marketplace Load</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-3xl font-bold text-slate-900"><Activity size={20} /> {stats.totalJobs}</p>
          <p className="mt-1 text-xs text-slate-500">{jobOpen} open jobs, {jobDisputed} disputed</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Risk Queue</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-3xl font-bold text-slate-900"><AlertTriangle size={20} /> {stats.disputes}</p>
          <p className="mt-1 text-xs text-slate-500">{contractHeld} contracts with held payouts</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-slate-900">Database Pulse</h2>
            <Database size={18} className="text-accent" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Users</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{users.length}</p>
              <p className="text-xs text-slate-500">{calcCollectionVolume(users, 7)} added in 7 days</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Jobs</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{jobs.length}</p>
              <p className="text-xs text-slate-500">{calcCollectionVolume(jobs, 7)} created in 7 days</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Contracts</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{contracts.length}</p>
              <p className="text-xs text-slate-500">{stats.activeContracts} active currently</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Transactions</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{transactions.length}</p>
              <p className="text-xs text-slate-500">{money(transactions.reduce((sum, item) => sum + item.amount, 0))} total flow</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Reviews</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{reviews.length}</p>
              <p className="text-xs text-slate-500">{calcCollectionVolume(reviews, 7)} created in 7 days</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Disputes</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{disputes.length}</p>
              <p className="text-xs text-slate-500">{stats.newSignupsToday} new signups today</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-heading text-xl font-semibold text-slate-900">Recent Activity</h2>
          <div className="mt-3 space-y-2">
            {recentActivity.length ? (
              recentActivity.map((event) => (
                <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">{event.label}</p>
                  <p className="text-xs text-slate-600">{event.detail}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">{toRelativeDate(event.at)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">No recent events found.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

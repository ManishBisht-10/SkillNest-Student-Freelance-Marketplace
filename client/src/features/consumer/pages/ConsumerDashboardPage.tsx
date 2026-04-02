import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import StatCard from "../../student/components/StatCard";
import EmptyState from "../../student/components/EmptyState";
import type { Contract, Job, Notification } from "../types/consumer";
import { getMyContracts, getNotifications, listMyJobs } from "../api/consumer.api";
import ConsumerPageSkeleton from "../components/ConsumerPageSkeleton";

export default function ConsumerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [jobsResponse, contractsResponse, notificationsResponse] = await Promise.all([
          listMyJobs(),
          getMyContracts(),
          getNotifications(),
        ]);

        setJobs(jobsResponse);
        setContracts(contractsResponse);
        setNotifications(notificationsResponse.slice(0, 5));
      } catch {
        toast.error("Unable to load consumer dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const activeJobs = useMemo(() => jobs.filter((job) => job.status === "open").length, [jobs]);
  const activeContracts = useMemo(
    () => contracts.filter((contract) => contract.status === "active").length,
    [contracts]
  );
  const spentThisMonth = useMemo(() => {
    const now = new Date();
    return contracts
      .filter((contract) => {
        const created = new Date(contract.createdAt);
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear() &&
          contract.paymentStatus !== "pending"
        );
      })
      .reduce((sum, contract) => sum + contract.agreedAmount, 0);
  }, [contracts]);

  const needsApproval = useMemo(
    () =>
      contracts.filter(
        (contract) => contract.status === "active" && Boolean(contract.completionSubmittedAt)
      ),
    [contracts]
  );

  if (loading) return <ConsumerPageSkeleton />;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h1 className="font-heading text-3xl font-bold">Consumer Dashboard</h1>
        <p className="mt-1 text-sm text-text/70">Manage jobs, contracts, and approvals in one place.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Active Jobs" value={String(activeJobs)} helper="Open for student bids" />
        <StatCard label="In-Progress Contracts" value={String(activeContracts)} helper="Currently active" />
        <StatCard
          label="Spent This Month"
          value={`₹${spentThisMonth.toLocaleString("en-IN")}`}
          helper="Escrowed or released"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold">Jobs Needing Action</h2>
            <Link to="/consumer/jobs" className="text-sm font-semibold text-accent">
              Manage jobs
            </Link>
          </div>
          <div className="grid gap-2">
            {needsApproval.length === 0 ? (
              <EmptyState title="No pending approvals" subtitle="Student submissions will show up here." />
            ) : (
              needsApproval.map((contract) => (
                <Link
                  key={contract._id}
                  to="/consumer/contracts"
                  className="rounded-xl border border-secondary/60 bg-black/15 p-3 transition hover:border-accent/70"
                >
                  <p className="font-medium text-white">Contract #{contract._id.slice(-6)}</p>
                  <p className="mt-1 text-xs text-text/70">
                    Submitted at {new Date(contract.completionSubmittedAt || "").toLocaleString()}
                  </p>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <h2 className="mb-3 font-heading text-xl font-semibold">Recent Notifications</h2>
          <div className="grid gap-2">
            {notifications.length === 0 ? (
              <EmptyState title="No notifications" subtitle="You are all caught up." />
            ) : (
              notifications.map((n) => (
                <div key={n._id} className="rounded-xl border border-secondary/60 bg-black/15 p-3">
                  <p className="text-sm text-white">{n.message}</p>
                  <p className="mt-1 text-xs text-text/60">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { toast } from "sonner";
import { getMyBids, getMyContracts, getNotifications, getStudentProfile, listOpenJobs } from "../api/student.api";
import type { Bid, Contract, Job, Notification, StudentProfile } from "../types/student";
import StatCard from "../components/StatCard";
import StudentPageSkeleton from "../components/StudentPageSkeleton";
import EmptyState from "../components/EmptyState";

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let isMounted = true;

    const load = async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }

      const [profileResult, bidsResult, contractsResult, jobsResult, notificationsResult] = await Promise.allSettled([
        getStudentProfile(),
        getMyBids(),
        getMyContracts(),
        listOpenJobs({ page: 1, limit: 12 }),
        getNotifications(),
      ]);

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value.profile);
      }

      if (bidsResult.status === "fulfilled") {
        setBids(bidsResult.value);
      }

      if (contractsResult.status === "fulfilled") {
        setContracts(contractsResult.value);
      }

      if (jobsResult.status === "fulfilled") {
        const fetchedProfile = profileResult.status === "fulfilled" ? profileResult.value.profile : null;
        const skillSet = new Set((fetchedProfile?.skills || []).map((s) => s.toLowerCase()));
        const ranked = [...jobsResult.value.items].sort((a, b) => {
          const aScore = a.skillsRequired.filter((skill) => skillSet.has(skill.toLowerCase())).length;
          const bScore = b.skillsRequired.filter((skill) => skillSet.has(skill.toLowerCase())).length;
          return bScore - aScore;
        });

        setRecommendedJobs(ranked.slice(0, 5));
        setLatestJobs(jobsResult.value.items.slice(0, 5));
      }

      if (notificationsResult.status === "fulfilled") {
        setNotifications(notificationsResult.value.slice(0, 5));
      }

      if (
        profileResult.status === "rejected" ||
        bidsResult.status === "rejected" ||
        contractsResult.status === "rejected" ||
        jobsResult.status === "rejected" ||
        notificationsResult.status === "rejected"
      ) {
        toast.error("Some dashboard data could not be loaded");
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    load(false);

    const refreshInterval = window.setInterval(load, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  const activeBids = useMemo(() => bids.filter((bid) => bid.status === "pending").length, [bids]);
  const activeContracts = useMemo(
    () => contracts.filter((contract) => contract.status === "active").length,
    [contracts]
  );

  if (loading) {
    return <StudentPageSkeleton />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">Welcome back</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-slate-900">Student Dashboard</h1>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Bids" value={String(activeBids)} helper="Pending proposals" />
        <StatCard label="Active Contracts" value={String(activeContracts)} helper="Work in progress" />
        <StatCard
          label="Total Earned"
          value={`₹${Number(profile?.totalEarnings || 0).toLocaleString("en-IN")}`}
          helper="Released payments"
        />
        <StatCard
          label="Rating"
          value={Number(profile?.rating || 0).toFixed(1)}
          helper={`${profile?.completedJobs || 0} completed jobs`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-slate-900">Recommended Jobs</h2>
            <Link to="/student/jobs" className="text-sm font-semibold text-accent">
              Browse all
            </Link>
          </div>
          <div className="grid gap-2">
            {recommendedJobs.length === 0 ? (
              <EmptyState
                title="No recommendations yet"
                subtitle="Complete your profile skills to improve matching. New open jobs are listed beside this card."
              />
            ) : (
              recommendedJobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/student/jobs/${job._id}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-accent/40 hover:bg-slate-100"
                >
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    ₹{job.budgetMin.toLocaleString("en-IN")} - ₹{job.budgetMax.toLocaleString("en-IN")}
                  </p>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-slate-900">Latest Open Jobs</h2>
            <Link to="/student/jobs" className="text-sm font-semibold text-accent">
              Browse all
            </Link>
          </div>
          <div className="grid gap-2">
            {latestJobs.length === 0 ? (
              <EmptyState title="No open jobs" subtitle="Check back after a consumer posts a new project." />
            ) : (
              latestJobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/student/jobs/${job._id}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-accent/40 hover:bg-slate-100"
                >
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {job.category} • ₹{job.budgetMin.toLocaleString("en-IN")} - ₹{job.budgetMax.toLocaleString("en-IN")}
                  </p>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-3 font-heading text-xl font-semibold text-slate-900">Recent Notifications</h2>
          <div className="grid gap-2">
            {notifications.length === 0 ? (
              <EmptyState title="No notifications" subtitle="You are all caught up." />
            ) : (
              notifications.map((n) => (
                <div key={n._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm text-slate-800">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

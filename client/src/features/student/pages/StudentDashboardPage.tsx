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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [profileResponse, bidsResponse, contractsResponse, jobsResponse, notificationsResponse] =
          await Promise.all([
            getStudentProfile(),
            getMyBids(),
            getMyContracts(),
            listOpenJobs({ page: 1, limit: 8 }),
            getNotifications(),
          ]);

        const fetchedProfile = profileResponse.profile;
        setProfile(fetchedProfile);
        setBids(bidsResponse);
        setContracts(contractsResponse);

        const skillSet = new Set((fetchedProfile?.skills || []).map((s) => s.toLowerCase()));
        const ranked = [...jobsResponse.items].sort((a, b) => {
          const aScore = a.skillsRequired.filter((skill) => skillSet.has(skill.toLowerCase())).length;
          const bScore = b.skillsRequired.filter((skill) => skillSet.has(skill.toLowerCase())).length;
          return bScore - aScore;
        });

        setRecommendedJobs(ranked.slice(0, 5));
        setNotifications(notificationsResponse.slice(0, 5));
      } catch {
        toast.error("Unable to load dashboard right now");
      } finally {
        setLoading(false);
      }
    };

    load();
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
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <p className="text-sm text-text/70">Welcome back</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-white">Student Dashboard</h1>
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
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold">Recommended Jobs</h2>
            <Link to="/student/jobs" className="text-sm font-semibold text-accent">
              Browse all
            </Link>
          </div>
          <div className="grid gap-2">
            {recommendedJobs.length === 0 ? (
              <EmptyState title="No recommendations yet" subtitle="Complete your profile skills to improve matching." />
            ) : (
              recommendedJobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/student/jobs/${job._id}`}
                  className="rounded-xl border border-secondary/60 bg-black/15 p-3 transition hover:border-accent/70"
                >
                  <p className="font-medium text-white">{job.title}</p>
                  <p className="mt-1 text-xs text-text/70">
                    ₹{job.budgetMin.toLocaleString("en-IN")} - ₹{job.budgetMax.toLocaleString("en-IN")}
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

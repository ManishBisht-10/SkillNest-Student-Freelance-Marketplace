import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { getMyBids } from "../api/student.api";
import EmptyState from "../components/EmptyState";
import StudentPageSkeleton from "../components/StudentPageSkeleton";
import type { Bid, Job } from "../types/student";

function resolveJob(bid: Bid): Job | null {
  return typeof bid.jobId === "string" ? null : bid.jobId;
}

export default function StudentBidsPage() {
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getMyBids();
        setBids(response);
      } catch {
        toast.error("Unable to load bids");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <StudentPageSkeleton />;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h1 className="font-heading text-3xl font-bold">My Bids</h1>
        <p className="mt-1 text-sm text-text/70">Track all your proposals and their status.</p>
      </section>

      {bids.length === 0 ? (
        <EmptyState title="No bids yet" subtitle="Explore jobs and submit your first proposal." />
      ) : (
        <section className="grid gap-3">
          {bids.map((bid) => {
            const job = resolveJob(bid);
            return (
              <article key={bid._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-white">
                      {job?.title || "Job"}
                    </h2>
                    <p className="text-sm text-text/70">
                      Bid amount: ₹{bid.bidAmount.toLocaleString("en-IN")} • Delivery {bid.deliveryDays} days
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      bid.status === "accepted"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : bid.status === "rejected"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {bid.status}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-text/80">{bid.proposalText}</p>

                {job?._id ? (
                  <div className="mt-3">
                    <Link to={`/student/jobs/${job._id}`} className="text-sm font-semibold text-accent">
                      View Job
                    </Link>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

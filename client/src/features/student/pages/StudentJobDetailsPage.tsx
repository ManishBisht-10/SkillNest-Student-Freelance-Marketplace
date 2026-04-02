import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { getJobById, getMyBids, submitBid } from "../api/student.api";
import StudentPageSkeleton from "../components/StudentPageSkeleton";
import type { Bid, Job } from "../types/student";

export default function StudentJobDetailsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [myBid, setMyBid] = useState<Bid | null>(null);

  const [proposalText, setProposalText] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      proposalText.trim().length >= 10 &&
      Number(bidAmount) > 0 &&
      Number(deliveryDays) > 0 &&
      !myBid &&
      job?.status === "open"
    );
  }, [proposalText, bidAmount, deliveryDays, myBid, job?.status]);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [jobResponse, myBids] = await Promise.all([getJobById(id), getMyBids()]);
        setJob(jobResponse);
        const matchedBid = myBids.find((bid) => {
          const jobId = typeof bid.jobId === "string" ? bid.jobId : bid.jobId?._id;
          return jobId === id;
        });
        setMyBid(matchedBid || null);
      } catch {
        toast.error("Unable to load job details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const onSubmitBid = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !canSubmit) return;

    setSubmitting(true);
    try {
      const bid = await submitBid({
        jobId: id,
        proposalText: proposalText.trim(),
        bidAmount: Number(bidAmount),
        deliveryDays: Number(deliveryDays),
      });
      setMyBid(bid);
      toast.success("Bid submitted successfully");
    } catch {
      toast.error("Unable to submit bid");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <StudentPageSkeleton />;
  if (!job) return <p className="text-sm text-text/70">Job not found.</p>;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <p className="text-xs uppercase tracking-wide text-accent">{job.category}</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-white">{job.title}</h1>
        <p className="mt-3 whitespace-pre-wrap text-sm text-text/80">{job.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.skillsRequired.map((skill) => (
            <span key={skill} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-text/80">
              {skill}
            </span>
          ))}
        </div>

        <p className="mt-4 text-sm text-text/70">
          Budget: ₹{job.budgetMin.toLocaleString("en-IN")} - ₹{job.budgetMax.toLocaleString("en-IN")} • Deadline {new Date(job.deadline).toLocaleDateString()}
        </p>
      </section>

      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h2 className="font-heading text-xl font-semibold">Submit Your Bid</h2>

        {myBid ? (
          <div className="mt-3 rounded-xl border border-accent/50 bg-accent/10 p-4 text-sm">
            You already submitted a bid. Current status: <strong>{myBid.status}</strong>
          </div>
        ) : (
          <form className="mt-4 grid gap-3" onSubmit={onSubmitBid}>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Proposal</span>
              <textarea
                className="min-h-28 rounded-xl border border-secondary/80 bg-white/5 p-3 text-sm outline-none focus:border-accent"
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                placeholder="Explain your approach and why you're a great fit..."
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Bid Amount (INR)"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              <Input
                label="Delivery Days"
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
              />
            </div>

            <Button type="submit" fullWidth disabled={!canSubmit || submitting}>
              {submitting ? "Submitting..." : "Submit Bid"}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import {
  acceptBid,
  getBidsForJob,
  getJobById,
  initiateEscrowPayment,
  rejectBid,
} from "../api/consumer.api";
import ConsumerPageSkeleton from "../components/ConsumerPageSkeleton";
import type { Bid, Contract, Job } from "../types/consumer";

export default function ConsumerJobDetailsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [createdContract, setCreatedContract] = useState<Contract | null>(null);
  const [acceptingBidId, setAcceptingBidId] = useState("");

  const acceptedBid = useMemo(() => bids.find((bid) => bid.status === "accepted") || null, [bids]);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [jobResponse, bidsResponse] = await Promise.all([getJobById(id), getBidsForJob(id)]);
        setJob(jobResponse);
        setBids(bidsResponse);
      } catch {
        toast.error("Unable to load job details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const onAcceptBid = async (bidId: string) => {
    setAcceptingBidId(bidId);
    try {
      const response = await acceptBid(bidId);
      setCreatedContract(response.contract);
      setBids((prev) =>
        prev.map((bid) => {
          if (bid._id === bidId) return { ...bid, status: "accepted" };
          if (bid.status === "pending") return { ...bid, status: "rejected" };
          return bid;
        })
      );
      toast.success("Bid accepted. Initiate escrow payment now.");
    } catch {
      toast.error("Unable to accept bid");
    } finally {
      setAcceptingBidId("");
    }
  };

  const onRejectBid = async (bidId: string) => {
    try {
      const updated = await rejectBid(bidId);
      setBids((prev) => prev.map((bid) => (bid._id === bidId ? updated : bid)));
      toast.success("Bid rejected");
    } catch {
      toast.error("Unable to reject bid");
    }
  };

  const onInitiatePayment = async () => {
    if (!createdContract) return;

    try {
      const response = await initiateEscrowPayment(createdContract._id);
      toast.success(
        `Escrow initiated. Order ${response.orderId.slice(-8)} created (${response.currency} ${
          response.amount / 100
        }).`
      );
    } catch {
      toast.error("Unable to initiate payment. Check payment gateway config.");
    }
  };

  if (loading) return <ConsumerPageSkeleton />;
  if (!job) return <p className="text-sm text-text/70">Job not found.</p>;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-secondary/70 bg-[linear-gradient(140deg,rgba(233,69,96,0.16),rgba(15,52,96,0.68))] p-5">
        <h1 className="font-heading text-3xl font-bold text-white">{job.title}</h1>
        <p className="mt-2 text-sm text-white/75">{job.description}</p>
        <p className="mt-3 text-sm text-text/70">
          Budget ₹{job.budgetMin.toLocaleString("en-IN")} - ₹{job.budgetMax.toLocaleString("en-IN")} • Status {job.status}
        </p>
      </section>

      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-semibold">Bids Received ({bids.length})</h2>
          {createdContract ? (
            <Button onClick={onInitiatePayment}>Initiate Escrow Payment</Button>
          ) : null}
        </div>

        {bids.length === 0 ? (
          <p className="text-sm text-text/70">No bids yet.</p>
        ) : (
          <div className="grid gap-3">
            {bids.map((bid) => {
              const student = typeof bid.studentId === "string" ? null : bid.studentId;
              return (
                <article key={bid._id} className="rounded-xl border border-secondary/60 bg-black/15 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{student?.name || "Student"}</p>
                      <p className="text-sm text-text/70">
                        ₹{bid.bidAmount.toLocaleString("en-IN")} • {bid.deliveryDays} days
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

                  <p className="mt-3 text-sm text-text/80">{bid.proposalText}</p>

                  {bid.status === "pending" && !acceptedBid ? (
                    <div className="mt-4 flex gap-2">
                      <Button onClick={() => onAcceptBid(bid._id)} disabled={acceptingBidId === bid._id}>
                        {acceptingBidId === bid._id ? "Accepting..." : "Accept"}
                      </Button>
                      <Button variant="secondary" onClick={() => onRejectBid(bid._id)}>
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

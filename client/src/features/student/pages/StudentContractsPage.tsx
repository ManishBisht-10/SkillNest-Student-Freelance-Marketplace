import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import { completeMilestone, getMyContracts, submitContractCompletion } from "../api/student.api";
import EmptyState from "../components/EmptyState";
import StudentPageSkeleton from "../components/StudentPageSkeleton";
import type { Contract, Job } from "../types/student";

function resolveContractJob(contract: Contract): Job | null {
  return typeof contract.jobId === "string" ? null : contract.jobId;
}

export default function StudentContractsPage() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const response = await getMyContracts();
      setContracts(response);
    } catch {
      toast.error("Unable to load contracts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const activeContracts = useMemo(
    () => contracts.filter((contract) => contract.status === "active"),
    [contracts]
  );

  const onCompleteMilestone = async (contractId: string, milestoneId: string) => {
    try {
      const updated = await completeMilestone(contractId, milestoneId);
      setContracts((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      toast.success("Milestone marked complete");
    } catch {
      toast.error("Unable to complete milestone");
    }
  };

  const onSubmitCompletion = async (contractId: string) => {
    try {
      const response = await submitContractCompletion(contractId);
      setContracts((prev) => prev.map((item) => (item._id === response.contract._id ? response.contract : item)));
      toast.success("Submitted for consumer approval");
    } catch {
      toast.error("Unable to submit contract completion");
    }
  };

  if (loading) return <StudentPageSkeleton />;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h1 className="font-heading text-3xl font-bold">Active Contracts</h1>
        <p className="mt-1 text-sm text-text/70">Track milestones and submit work for approval.</p>
      </section>

      {activeContracts.length === 0 ? (
        <EmptyState title="No active contracts" subtitle="Accepted bids will appear here." />
      ) : (
        <section className="grid gap-4">
          {activeContracts.map((contract) => {
            const job = resolveContractJob(contract);
            const hasMilestones = contract.milestones.length > 0;
            const allDone = hasMilestones
              ? contract.milestones.every((milestone) => milestone.isCompleted)
              : true;

            return (
              <article key={contract._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-white">
                      {job?.title || "Contract"}
                    </h2>
                    <p className="text-sm text-text/70">
                      Amount ₹{contract.agreedAmount.toLocaleString("en-IN")} • Payment {contract.paymentStatus}
                    </p>
                  </div>
                  <Link
                    to={`/student/chat?roomContract=${contract._id}`}
                    className="rounded-xl border border-accent/50 px-3 py-1.5 text-sm font-semibold text-accent"
                  >
                    Open Chat
                  </Link>
                </div>

                {hasMilestones ? (
                  <div className="mt-4 grid gap-2">
                    {contract.milestones.map((milestone) => (
                      <div
                        key={milestone._id}
                        className="flex items-center justify-between rounded-xl border border-secondary/60 bg-black/15 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{milestone.title}</p>
                          <p className="text-xs text-text/60">
                            Due {new Date(milestone.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        {milestone.isCompleted ? (
                          <span className="text-xs font-semibold text-emerald-300">Completed</span>
                        ) : (
                          <Button
                            variant="secondary"
                            onClick={() => onCompleteMilestone(contract._id, milestone._id)}
                          >
                            Mark Done
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-text/70">No milestones defined for this contract.</p>
                )}

                <div className="mt-4">
                  <Button
                    onClick={() => onSubmitCompletion(contract._id)}
                    disabled={!allDone || Boolean(contract.completionSubmittedAt)}
                  >
                    {contract.completionSubmittedAt ? "Awaiting Consumer Approval" : "Submit Contract Completion"}
                  </Button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

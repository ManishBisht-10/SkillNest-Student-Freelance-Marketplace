import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import { approveContract, getMyContracts } from "../api/consumer.api";
import ConsumerPageSkeleton from "../components/ConsumerPageSkeleton";
import type { Contract, Job } from "../types/consumer";

function resolveJob(contract: Contract): Job | null {
  return typeof contract.jobId === "string" ? null : contract.jobId;
}

export default function ConsumerContractsPage() {
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

  const activeContracts = useMemo(() => contracts.filter((contract) => contract.status === "active"), [contracts]);

  const onApprove = async (contractId: string) => {
    try {
      const response = await approveContract(contractId);
      setContracts((prev) => prev.map((item) => (item._id === response.contract._id ? response.contract : item)));
      toast.success("Contract approved and payment released");
    } catch {
      toast.error("Unable to approve contract");
    }
  };

  if (loading) return <ConsumerPageSkeleton />;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-secondary/70 bg-[linear-gradient(140deg,rgba(233,69,96,0.16),rgba(15,52,96,0.68))] p-5">
        <h1 className="font-heading text-3xl font-bold text-white">Consumer Contracts</h1>
        <p className="mt-1 text-sm text-white/75">Review submissions and approve completed work.</p>
      </section>

      <section className="grid gap-3">
        {activeContracts.map((contract) => {
          const job = resolveJob(contract);
          const canApprove = Boolean(contract.completionSubmittedAt) && contract.paymentStatus === "held";

          return (
            <article key={contract._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-white">{job?.title || "Contract"}</h2>
                  <p className="text-sm text-text/70">
                    Amount ₹{contract.agreedAmount.toLocaleString("en-IN")} • Payment {contract.paymentStatus}
                  </p>
                </div>
                <Link
                  to={`/consumer/chat?roomContract=${contract._id}`}
                  className="rounded-xl border border-accent/50 px-3 py-1.5 text-sm font-semibold text-accent"
                >
                  Open Chat
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => onApprove(contract._id)} disabled={!canApprove}>
                  {canApprove ? "Approve & Release Payment" : "Awaiting submission or escrow hold"}
                </Button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

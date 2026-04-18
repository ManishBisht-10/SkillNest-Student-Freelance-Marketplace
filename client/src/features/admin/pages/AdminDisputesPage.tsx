import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import Button from "../../../shared/components/Button";
import { listAdminDisputes, resolveAdminDispute } from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type { AdminContract } from "../types/admin";

function getName(entity: AdminContract["studentId"] | AdminContract["consumerId"]) {
  return typeof entity === "string" ? entity : entity?.name || "Unknown";
}

function getTitle(contract: AdminContract) {
  return typeof contract.jobId === "string" ? contract.jobId : contract.jobId?.title || "Untitled job";
}

export default function AdminDisputesPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AdminContract[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await listAdminDisputes());
    } catch {
      toast.error("Unable to load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onResolve = async (contractId: string, decision: "release" | "refund") => {
    try {
      const response = await resolveAdminDispute(contractId, decision);
      setItems((prev) => prev.filter((item) => item._id !== contractId));
      toast.success(response.message);
    } catch {
      toast.error("Unable to resolve dispute");
    }
  };

  if (loading) return <AdminPageSkeleton />;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-secondary/70 bg-[linear-gradient(140deg,rgba(233,69,96,0.16),rgba(15,52,96,0.68))] p-5">
        <h1 className="font-heading text-3xl font-bold text-white">Dispute Resolution Desk</h1>
        <p className="mt-1 text-sm text-white/75">Resolve payment and delivery conflicts with an auditable decision trail.</p>
      </section>

      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
        <p className="flex items-center gap-2 text-sm text-text/75"><AlertTriangle size={16} className="text-accent" /> Open disputes: <span className="font-semibold text-white">{items.length}</span></p>
      </section>

      <section className="grid gap-3">
        {items.length ? (
          items.map((contract) => (
            <article key={contract._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
              <h2 className="font-heading text-lg font-semibold text-white">{getTitle(contract)}</h2>
              <p className="text-sm text-text/70">Contract #{contract._id.slice(-8)} • Amount ₹{contract.agreedAmount.toLocaleString("en-IN")}</p>
              <p className="mt-2 text-sm text-text/70">Student: {getName(contract.studentId)} • Consumer: {getName(contract.consumerId)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => onResolve(contract._id, "release")}>Release to Student</Button>
                <Button variant="secondary" onClick={() => onResolve(contract._id, "refund")}>Refund Consumer</Button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5 text-sm text-text/70">
            No disputes currently. Great platform health.
          </div>
        )}
      </section>
    </div>
  );
}

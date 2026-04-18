import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText, Landmark, ShieldAlert } from "lucide-react";

import { listAdminContracts } from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type { AdminContract } from "../types/admin";

function getName(entity: AdminContract["studentId"] | AdminContract["consumerId"]) {
  return typeof entity === "string" ? entity : entity?.name || "Unknown";
}

function getContractTitle(contract: AdminContract) {
  return typeof contract.jobId === "string" ? contract.jobId : contract.jobId?.title || "Untitled job";
}

export default function AdminContractsPage() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<AdminContract[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        setContracts(await listAdminContracts());
      } catch {
        toast.error("Unable to load contracts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <AdminPageSkeleton />;

  const activeContracts = contracts.filter((contract) => contract.status === "active").length;
  const disputedContracts = contracts.filter((contract) => contract.status === "disputed").length;
  const heldPayments = contracts.filter((contract) => contract.paymentStatus === "held").length;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-secondary/70 bg-[linear-gradient(140deg,rgba(233,69,96,0.16),rgba(15,52,96,0.68))] p-5">
        <h1 className="font-heading text-3xl font-bold text-white">Contract Supervision</h1>
        <p className="mt-1 text-sm text-white/75">Observe lifecycle status, payout stage, and escalation signals.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Total Contracts</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><FileText size={18} /> {contracts.length}</p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Active vs Disputed</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><ShieldAlert size={18} /> {activeContracts} / {disputedContracts}</p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Held Payments</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><Landmark size={18} /> {heldPayments}</p>
        </article>
      </section>

      <section className="grid gap-3">
        {contracts.length ? (
          contracts.map((contract) => (
            <article key={contract._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-white">{getContractTitle(contract)}</h2>
                  <p className="text-sm text-text/70">Contract #{contract._id.slice(-8)} • Updated {new Date(contract.updatedAt).toLocaleDateString()}</p>
                  <p className="mt-2 text-sm text-text/70">Student: {getName(contract.studentId)} • Consumer: {getName(contract.consumerId)}</p>
                  <p className="mt-1 text-sm text-text/70">Amount ₹{contract.agreedAmount.toLocaleString("en-IN")}</p>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="rounded-full border border-secondary/80 bg-primary/45 px-2.5 py-1 uppercase tracking-wide text-text/75">{contract.status}</span>
                    <span className="rounded-full border border-secondary/80 bg-primary/45 px-2.5 py-1 uppercase tracking-wide text-text/75">{contract.paymentStatus}</span>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5 text-sm text-text/70">
            No contracts available.
          </div>
        )}
      </section>
    </div>
  );
}

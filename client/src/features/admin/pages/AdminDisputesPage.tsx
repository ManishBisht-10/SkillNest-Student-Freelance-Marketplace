import { useEffect, useState } from "react";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import { listAdminDisputes, resolveAdminDispute } from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type { AdminContract } from "../types/admin";

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
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h1 className="font-heading text-3xl font-bold">Disputes</h1>
      </section>

      <section className="grid gap-3">
        {items.map((contract) => (
          <article key={contract._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
            <h2 className="font-heading text-lg font-semibold text-white">Contract #{contract._id.slice(-8)}</h2>
            <p className="mt-1 text-sm text-text/70">Amount ₹{contract.agreedAmount.toLocaleString("en-IN")}</p>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => onResolve(contract._id, "release")}>Release to Student</Button>
              <Button variant="secondary" onClick={() => onResolve(contract._id, "refund")}>Refund Consumer</Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

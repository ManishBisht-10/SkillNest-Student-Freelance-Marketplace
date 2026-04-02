import { useEffect, useState } from "react";
import { toast } from "sonner";

import { listAdminContracts } from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type { AdminContract } from "../types/admin";

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

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h1 className="font-heading text-3xl font-bold">All Contracts</h1>
      </section>

      <section className="grid gap-3">
        {contracts.map((contract) => (
          <article key={contract._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
            <h2 className="font-heading text-lg font-semibold text-white">Contract #{contract._id.slice(-8)}</h2>
            <p className="mt-1 text-sm text-text/70">Status {contract.status} • Payment {contract.paymentStatus}</p>
            <p className="mt-1 text-sm text-text/70">Amount ₹{contract.agreedAmount.toLocaleString("en-IN")}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

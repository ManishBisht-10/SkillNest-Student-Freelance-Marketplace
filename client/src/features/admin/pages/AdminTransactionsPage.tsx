import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Landmark, TrendingDown, TrendingUp } from "lucide-react";

import Button from "../../../shared/components/Button";
import { listAdminTransactions } from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type { AdminTransaction } from "../types/admin";

export default function AdminTransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AdminTransaction[]>([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setItems(
        await listAdminTransactions({
          type: (type || undefined) as "payment" | "release" | "refund" | undefined,
          status: status || undefined,
        })
      );
    } catch {
      toast.error("Unable to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <AdminPageSkeleton />;

  const grossFlow = items.reduce((sum, item) => sum + item.amount, 0);
  const releaseFlow = items.filter((item) => item.type === "release").reduce((sum, item) => sum + item.amount, 0);
  const refundFlow = items.filter((item) => item.type === "refund").reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-secondary/70 bg-[linear-gradient(140deg,rgba(233,69,96,0.16),rgba(15,52,96,0.68))] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white">Payment Observatory</h1>
            <p className="mt-1 text-sm text-white/75">Inspect every payment, release, and refund event.</p>
          </div>
          <div className="flex gap-2">
            <select className="h-11 rounded-xl border border-secondary/80 bg-white/5 px-3 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All</option>
              <option value="payment">Payment</option>
              <option value="release">Release</option>
              <option value="refund">Refund</option>
            </select>
            <select className="h-11 rounded-xl border border-secondary/80 bg-white/5 px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Any status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <Button onClick={load}>Filter</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Total Flow</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><Landmark size={18} /> ₹{grossFlow.toLocaleString("en-IN")}</p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Release Volume</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><TrendingUp size={18} /> ₹{releaseFlow.toLocaleString("en-IN")}</p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Refund Volume</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><TrendingDown size={18} /> ₹{refundFlow.toLocaleString("en-IN")}</p>
        </article>
      </section>

      <section className="grid gap-3">
        {items.length ? (
          items.map((item) => (
            <article key={item._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
              <h2 className="font-heading text-lg font-semibold text-white">{item.type.toUpperCase()}</h2>
              <p className="mt-1 text-sm text-text/70">₹{item.amount.toLocaleString("en-IN")} • {item.status}</p>
              <p className="mt-1 text-xs text-text/60">Contract {typeof item.contractId === "string" ? item.contractId.slice(-8) : item.contractId?._id?.slice(-8)}</p>
              <p className="mt-1 text-xs text-text/60">{new Date(item.createdAt).toLocaleString()}</p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5 text-sm text-text/70">
            No transactions found for the selected filters.
          </div>
        )}
      </section>
    </div>
  );
}

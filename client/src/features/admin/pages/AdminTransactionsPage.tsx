import { useEffect, useState } from "react";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import { listAdminTransactions } from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type { AdminTransaction } from "../types/admin";

export default function AdminTransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AdminTransaction[]>([]);
  const [type, setType] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setItems(
        await listAdminTransactions({
          type: (type || undefined) as "payment" | "release" | "refund" | undefined,
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

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-heading text-3xl font-bold">Transactions</h1>
          <div className="flex gap-2">
            <select className="h-11 rounded-xl border border-secondary/80 bg-white/5 px-3 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All</option>
              <option value="payment">Payment</option>
              <option value="release">Release</option>
              <option value="refund">Refund</option>
            </select>
            <Button onClick={load}>Filter</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        {items.map((item) => (
          <article key={item._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
            <h2 className="font-heading text-lg font-semibold text-white">{item.type.toUpperCase()}</h2>
            <p className="mt-1 text-sm text-text/70">₹{item.amount.toLocaleString("en-IN")} • {item.status}</p>
            <p className="mt-1 text-xs text-text/60">{new Date(item.createdAt).toLocaleString()}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

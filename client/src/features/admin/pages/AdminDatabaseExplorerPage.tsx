import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Database, Download, Layers3, Users, BriefcaseBusiness, ScrollText, BadgeIndianRupee, Star } from "lucide-react";

import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import {
  listAdminContracts,
  listAdminDisputes,
  listAdminJobs,
  listAdminReviews,
  listAdminStudentProfiles,
  listAdminTransactions,
  listAdminUsers,
} from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type {
  AdminContract,
  AdminJob,
  AdminReview,
  AdminStudentProfile,
  AdminTransaction,
  AdminUser,
} from "../types/admin";

type ExplorerTab =
  | "users"
  | "studentProfiles"
  | "jobs"
  | "contracts"
  | "disputes"
  | "transactions"
  | "reviews";

type ExplorerState = {
  users: AdminUser[];
  studentProfiles: AdminStudentProfile[];
  jobs: AdminJob[];
  contracts: AdminContract[];
  disputes: AdminContract[];
  transactions: AdminTransaction[];
  reviews: AdminReview[];
};

const TAB_ORDER: ExplorerTab[] = [
  "users",
  "studentProfiles",
  "jobs",
  "contracts",
  "disputes",
  "transactions",
  "reviews",
];

function stringifyForSearch(record: unknown) {
  return JSON.stringify(record).toLowerCase();
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";

  const keys = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  const escape = (value: unknown) => {
    const normalized = value == null ? "" : String(value);
    const escaped = normalized.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const header = keys.map(escape).join(",");
  const lines = rows.map((row) => keys.map((key) => escape(row[key])).join(","));
  return [header, ...lines].join("\n");
}

function flattenRecord(input: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  const walk = (value: unknown, prefix: string) => {
    if (value == null) {
      result[prefix] = "";
      return;
    }

    if (Array.isArray(value)) {
      result[prefix] = value.map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item))).join(" | ");
      return;
    }

    if (typeof value === "object") {
      Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
        walk(child, prefix ? `${prefix}.${key}` : key);
      });
      return;
    }

    result[prefix] = value;
  };

  walk(input, "");
  return result;
}

export default function AdminDatabaseExplorerPage() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<ExplorerState>({
    users: [],
    studentProfiles: [],
    jobs: [],
    contracts: [],
    disputes: [],
    transactions: [],
    reviews: [],
  });
  const [activeTab, setActiveTab] = useState<ExplorerTab>("users");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const loadAll = async () => {
    setLoading(true);
    try {
      const [usersResult, studentProfilesResult, jobsResult, contractsResult, disputesResult, transactionsResult, reviewsResult] =
        await Promise.allSettled([
          listAdminUsers(),
          listAdminStudentProfiles(),
          listAdminJobs(),
          listAdminContracts(),
          listAdminDisputes(),
          listAdminTransactions(),
          listAdminReviews(),
        ]);

      const nextState = {
        users: usersResult.status === "fulfilled" ? usersResult.value : [],
        studentProfiles: studentProfilesResult.status === "fulfilled" ? studentProfilesResult.value : [],
        jobs: jobsResult.status === "fulfilled" ? jobsResult.value : [],
        contracts: contractsResult.status === "fulfilled" ? contractsResult.value : [],
        disputes: disputesResult.status === "fulfilled" ? disputesResult.value : [],
        transactions: transactionsResult.status === "fulfilled" ? transactionsResult.value : [],
        reviews: reviewsResult.status === "fulfilled" ? reviewsResult.value : [],
      };

      setState(nextState);

      const failures = [usersResult, studentProfilesResult, jobsResult, contractsResult, disputesResult, transactionsResult, reviewsResult].filter(
        (result) => result.status === "rejected"
      ).length;

      if (failures > 0) {
        toast.warning(`Database explorer refreshed with ${failures} data source${failures === 1 ? "" : "s"} unavailable`);
      } else {
        toast.success("Database explorer refreshed");
      }
    } catch {
      toast.error("Unable to load database explorer data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeTab, query]);

  const tabData = state[activeTab] as unknown[];

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return tabData;
    return tabData.filter((record) => stringifyForSearch(record).includes(normalized));
  }, [tabData, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns = useMemo(() => {
    const sample = pagedRows[0] as Record<string, unknown> | undefined;
    if (!sample) return [];
    return Object.keys(flattenRecord(sample)).slice(0, 8);
  }, [pagedRows]);

  const totalRecords = TAB_ORDER.reduce((sum, tab) => sum + state[tab].length, 0);
  const activeCount = state[activeTab].length;
  const studentProfileCount = state.studentProfiles.length;
  const openJobsCount = state.jobs.filter((job) => job.status === "open").length;
  const activeContractsCount = state.contracts.filter((contract) => contract.status === "active").length;
  const completedTransactionsCount = state.transactions.filter((transaction) => transaction.status === "completed").length;

  const exportCurrentTab = () => {
    const flattened = filtered.map((record) => flattenRecord(record)) as Record<string, unknown>[];
    const csv = toCsv(flattened);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeTab}-explorer.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) return <AdminPageSkeleton />;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-secondary/70 bg-[linear-gradient(140deg,rgba(233,69,96,0.16),rgba(15,52,96,0.68))] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white">Database Explorer</h1>
            <p className="mt-1 text-sm text-white/75">Collection-like, searchable views for all admin-accessible data sources.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadAll}>Refresh Snapshot</Button>
            <Button onClick={exportCurrentTab}><Download size={16} className="mr-2" />Export CSV</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Total Records</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white">
            <Layers3 size={18} /> {totalRecords}
          </p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Active View</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white">
            <Database size={18} /> {activeCount}
          </p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Student Profiles</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white">
            <Users size={18} /> {studentProfileCount}
          </p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Open Jobs</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white">
            <BriefcaseBusiness size={18} /> {openJobsCount}
          </p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Active Contracts</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white">
            <ScrollText size={18} /> {activeContractsCount}
          </p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Completed Transactions</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white">
            <BadgeIndianRupee size={18} /> {completedTransactionsCount}
          </p>
        </article>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {TAB_ORDER.map((tab) => {
          const count = state[tab].length;
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-accent bg-accent/20 text-white"
                  : "border-secondary/70 bg-secondary/20 text-text/80 hover:bg-secondary/30"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.15em]">{tab}</p>
              <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold"><Database size={18} />{count}</p>
            </button>
          );
        })}
      </section>

      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            label={`Search ${activeTab}`}
            placeholder="Type to filter records"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-end">
            <p className="rounded-xl border border-secondary/80 bg-primary/45 px-3 py-2 text-sm text-text/75">
              Showing {pagedRows.length} of {filtered.length}
            </p>
          </div>
        </div>

        {pagedRows.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-secondary/70 text-text/65">
                  {columns.map((column) => (
                    <th key={column} className="px-2 py-2 font-medium">{column || "root"}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row, idx) => {
                  const flat = flattenRecord(row);
                  return (
                    <tr key={idx} className="border-b border-secondary/50 align-top last:border-none">
                      {columns.map((column) => (
                        <td key={column} className="max-w-[240px] truncate px-2 py-2 text-text/80" title={String(flat[column] ?? "")}>
                          {String(flat[column] ?? "")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-secondary/70 bg-primary/45 px-3 py-4 text-sm text-text/70">
            No records matched this query.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-text/65">Page {safePage} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={safePage <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              Previous
            </Button>
            <Button variant="secondary" disabled={safePage >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

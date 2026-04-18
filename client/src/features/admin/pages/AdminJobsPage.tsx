import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BriefcaseBusiness, CircleDollarSign, OctagonAlert } from "lucide-react";

import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { deleteAdminJob, listAdminJobs } from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type { AdminJob } from "../types/admin";

export default function AdminJobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setJobs(await listAdminJobs(status || undefined));
    } catch {
      toast.error("Unable to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        if (!query.trim()) return true;
        const haystack = `${job.title} ${job.description} ${job.postedBy?.name || ""}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
      }),
    [jobs, query]
  );

  const openJobs = filteredJobs.filter((job) => job.status === "open").length;
  const disputedJobs = filteredJobs.filter((job) => job.status === "disputed").length;
  const avgTicket =
    filteredJobs.length > 0
      ? Math.round(
          filteredJobs.reduce((sum, job) => sum + (Number(job.budgetMin) + Number(job.budgetMax)) / 2, 0) /
            filteredJobs.length
        )
      : 0;

  const onDelete = async (jobId: string) => {
    try {
      await deleteAdminJob(jobId);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      toast.success("Job removed");
    } catch {
      toast.error("Unable to remove job");
    }
  };

  if (loading) return <AdminPageSkeleton />;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-secondary/70 bg-[linear-gradient(140deg,rgba(233,69,96,0.16),rgba(15,52,96,0.68))] p-5">
        <h1 className="font-heading text-3xl font-bold text-white">Job Intelligence</h1>
        <p className="mt-1 text-sm text-white/75">Track marketplace demand, ticket size, and job risk.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto]">
          <Input label="Search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title, description, or poster" />
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-text/90">Status</span>
            <select className="h-11 rounded-xl border border-secondary/80 bg-white/5 px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button onClick={load}>Refresh</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Visible Jobs</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><BriefcaseBusiness size={18} /> {filteredJobs.length}</p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Open vs Disputed</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><OctagonAlert size={18} /> {openJobs} / {disputedJobs}</p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Avg Ticket</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><CircleDollarSign size={18} /> ₹{avgTicket.toLocaleString("en-IN")}</p>
        </article>
      </section>

      <section className="grid gap-3">
        {filteredJobs.length ? (
          filteredJobs.map((job) => (
            <article key={job._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-white">{job.title}</h2>
                  <p className="text-sm text-text/70">{job.postedBy?.name || "Consumer"} • {job.postedBy?.email || ""}</p>
                  <p className="mt-1 text-xs text-text/60">{job.category} • {new Date(job.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-secondary/80 bg-primary/45 px-2.5 py-1 uppercase tracking-wide text-text/75">{job.status}</span>
                    <span className="rounded-full border border-secondary/80 bg-primary/45 px-2.5 py-1 text-text/75">
                      Budget ₹{job.budgetMin.toLocaleString("en-IN")} - ₹{job.budgetMax.toLocaleString("en-IN")}
                    </span>
                    {job.skillsRequired.slice(0, 3).map((skill) => (
                      <span key={skill} className="rounded-full border border-secondary/80 bg-primary/45 px-2.5 py-1 text-text/75">{skill}</span>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" onClick={() => onDelete(job._id)}>Delete</Button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5 text-sm text-text/70">
            No jobs found for current filter/search.
          </div>
        )}
      </section>
    </div>
  );
}

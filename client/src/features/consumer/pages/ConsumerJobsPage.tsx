import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { cancelJob, listMyJobs, updateJob } from "../api/consumer.api";
import ConsumerPageSkeleton from "../components/ConsumerPageSkeleton";
import type { Job } from "../types/consumer";

export default function ConsumerJobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [editingJobId, setEditingJobId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await listMyJobs();
      setJobs(response);
    } catch {
      toast.error("Unable to load your jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const visibleJobs = useMemo(() => {
    if (!query.trim()) return jobs;
    const needle = query.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(needle) ||
        job.category.toLowerCase().includes(needle) ||
        job.status.toLowerCase().includes(needle)
    );
  }, [jobs, query]);

  const onCancelJob = async (jobId: string) => {
    try {
      const updated = await cancelJob(jobId);
      setJobs((prev) => prev.map((job) => (job._id === jobId ? updated : job)));
      toast.success("Job cancelled");
    } catch {
      toast.error("Unable to cancel this job");
    }
  };

  const onSaveJobTitle = async (jobId: string) => {
    try {
      const updated = await updateJob(jobId, { title: editingTitle.trim() });
      setJobs((prev) => prev.map((job) => (job._id === jobId ? updated : job)));
      setEditingJobId("");
      setEditingTitle("");
      toast.success("Job updated");
    } catch {
      toast.error("Unable to update job");
    }
  };

  if (loading) return <ConsumerPageSkeleton />;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h1 className="font-heading text-3xl font-bold">My Posted Jobs</h1>
        <p className="mt-1 text-sm text-text/70">Edit open jobs, review bids, and manage status.</p>
        <div className="mt-4 max-w-sm">
          <Input label="Search" placeholder="Filter by title, category, status" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </section>

      <section className="grid gap-3">
        {visibleJobs.map((job) => (
          <article key={job._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {editingJobId === job._id ? (
                  <div className="flex max-w-xl gap-2">
                    <input
                      className="h-10 flex-1 rounded-xl border border-secondary/80 bg-white/5 px-3 text-sm"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                    />
                    <Button onClick={() => onSaveJobTitle(job._id)}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditingJobId("")}>Cancel</Button>
                  </div>
                ) : (
                  <h2 className="font-heading text-xl font-semibold text-white">{job.title}</h2>
                )}
                <p className="mt-1 text-sm text-text/70">{job.category}</p>
              </div>

              <span className="rounded-full border border-accent/50 px-3 py-1 text-xs font-semibold text-accent">
                {job.status}
              </span>
            </div>

            <p className="mt-3 text-sm text-text/80">
              Budget ₹{job.budgetMin.toLocaleString("en-IN")} - ₹{job.budgetMax.toLocaleString("en-IN")} • Deadline {new Date(job.deadline).toLocaleDateString()}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={`/consumer/jobs/${job._id}`} className="rounded-xl border border-secondary px-3 py-2 text-sm font-semibold hover:bg-white/10">
                View Details
              </Link>
              {job.status === "open" ? (
                <>
                  <Button variant="secondary" onClick={() => {
                    setEditingJobId(job._id);
                    setEditingTitle(job.title);
                  }}>
                    Edit Title
                  </Button>
                  <Button variant="ghost" onClick={() => onCancelJob(job._id)}>
                    Cancel Job
                  </Button>
                </>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import { deleteAdminJob, listAdminJobs } from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type { AdminJob } from "../types/admin";

export default function AdminJobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<AdminJob[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      setJobs(await listAdminJobs());
    } catch {
      toast.error("Unable to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h1 className="font-heading text-3xl font-bold">All Jobs</h1>
      </section>

      <section className="grid gap-3">
        {jobs.map((job) => (
          <article key={job._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-semibold text-white">{job.title}</h2>
                <p className="text-sm text-text/70">{job.postedBy?.name || "Consumer"} • {job.status}</p>
              </div>
              <Button variant="ghost" onClick={() => onDelete(job._id)}>Delete</Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

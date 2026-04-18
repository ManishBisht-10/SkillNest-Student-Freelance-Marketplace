import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { listOpenJobs } from "../api/student.api";
import EmptyState from "../components/EmptyState";
import StudentPageSkeleton from "../components/StudentPageSkeleton";
import type { Job } from "../types/student";

export default function StudentJobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState("");
  const [search, setSearch] = useState("");
  const categoryRef = useRef(category);
  const skillsRef = useRef(skills);

  categoryRef.current = category;
  skillsRef.current = skills;

  const loadJobs = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const response = await listOpenJobs({
        category: categoryRef.current.trim() || undefined,
        skills: skillsRef.current.trim() || undefined,
        limit: 40,
      });
      setJobs(response.items);
    } catch {
      if (!silent) {
        toast.error("Failed to load jobs");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const refresh = async (silent = false) => {
      if (!isMounted) return;
      await loadJobs({ silent });
    };

    refresh(false);

    const refreshInterval = window.setInterval(() => {
      refresh(true);
    }, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  const visibleJobs = useMemo(() => {
    if (!search.trim()) return jobs;
    const needle = search.trim().toLowerCase();
    return jobs.filter((job) => {
      return (
        job.title.toLowerCase().includes(needle) ||
        job.description.toLowerCase().includes(needle) ||
        job.skillsRequired.some((skill) => skill.toLowerCase().includes(needle))
      );
    });
  }, [jobs, search]);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-secondary/70 bg-[linear-gradient(140deg,rgba(233,69,96,0.16),rgba(15,52,96,0.68))] p-5">
        <h1 className="font-heading text-3xl font-bold text-white">Browse Jobs</h1>
        <p className="mt-1 text-sm text-white/75">Find open projects that match your skills.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Input label="Search" placeholder="Design, React, API..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Input label="Category" placeholder="Web Development" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input label="Skills" placeholder="react,node,mongodb" value={skills} onChange={(e) => setSkills(e.target.value)} />
          <div className="flex items-end">
            <Button fullWidth onClick={loadJobs}>Apply Filters</Button>
          </div>
        </div>
      </section>

      {loading ? (
        <StudentPageSkeleton />
      ) : visibleJobs.length === 0 ? (
        <EmptyState title="No matching jobs" subtitle="Try broadening your filters." />
      ) : (
        <section className="grid gap-3">
          {visibleJobs.map((job) => (
            <article key={job._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-white">{job.title}</h2>
                  <p className="mt-1 text-sm text-text/70">Posted by {job.postedBy?.name || "Consumer"}</p>
                </div>
                <p className="rounded-full border border-accent/60 px-3 py-1 text-xs font-semibold text-accent">
                  {job.category}
                </p>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-text/80">{job.description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {job.skillsRequired.map((skill) => (
                  <span key={skill} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-text/80">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-text/75">
                  ₹{job.budgetMin.toLocaleString("en-IN")} - ₹{job.budgetMax.toLocaleString("en-IN")} • Due {new Date(job.deadline).toLocaleDateString()}
                </div>
                <Link to={`/student/jobs/${job._id}`} className="text-sm font-semibold text-accent">
                  View & Bid
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

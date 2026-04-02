import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { createJob } from "../api/consumer.api";

export default function ConsumerPostJobPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const min = Number(budgetMin);
    const max = Number(budgetMax);
    return (
      title.trim().length >= 4 &&
      description.trim().length >= 10 &&
      category.trim().length >= 2 &&
      min > 0 &&
      max > 0 &&
      min <= max &&
      Boolean(deadline)
    );
  }, [title, description, category, budgetMin, budgetMax, deadline]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await createJob({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        skillsRequired: skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        deadline,
      });
      toast.success("Job posted successfully");
      navigate("/consumer/jobs");
    } catch {
      toast.error("Unable to post job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h1 className="font-heading text-3xl font-bold">Post a New Job</h1>
        <p className="mt-1 text-sm text-text/70">Describe your requirement and invite bids from students.</p>
      </section>

      <form className="grid gap-3 rounded-2xl border border-secondary/70 bg-secondary/20 p-5" onSubmit={onSubmit}>
        <Input label="Title" placeholder="Build my portfolio website" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-text/90">Description</span>
          <textarea
            className="min-h-32 rounded-xl border border-secondary/80 bg-white/5 p-3 text-sm text-white placeholder:text-text/40 outline-none focus:border-accent"
            placeholder="Describe scope, expected outcomes, and references"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Category" placeholder="Web Development" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input label="Skills (comma-separated)" placeholder="react,node,mongodb" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Budget Min" type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
          <Input label="Budget Max" type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
          <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>

        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? "Posting..." : "Post Job"}
        </Button>
      </form>
    </div>
  );
}

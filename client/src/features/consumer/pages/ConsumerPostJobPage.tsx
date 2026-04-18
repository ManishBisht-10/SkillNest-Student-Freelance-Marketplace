import { useState } from "react";
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

  const validateForm = () => {
    const errors: string[] = [];
    const min = Number(budgetMin);
    const max = Number(budgetMax);

    if (title.trim().length < 4) errors.push("Title is required");
    if (description.trim().length < 10) errors.push("Description is required");
    if (category.trim().length < 2) errors.push("Category is required");
    if (!Number.isFinite(min) || min <= 0) errors.push("Budget min must be greater than zero");
    if (!Number.isFinite(max) || max <= 0) errors.push("Budget max must be greater than zero");
    if (Number.isFinite(min) && Number.isFinite(max) && min > max) {
      errors.push("Budget min must be less than or equal to budget max");
    }
    if (!deadline) errors.push("Deadline is required");

    return errors;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

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
    } catch (error) {
      console.error("Unable to post job", error);
      toast.error("Unable to post job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-secondary/70 bg-[linear-gradient(140deg,rgba(233,69,96,0.16),rgba(15,52,96,0.68))] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Consumer Workspace</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-white">Post a New Job</h1>
        <p className="mt-1 text-sm text-text/75">Describe your requirement and invite bids from students.</p>
      </section>

      <form className="grid gap-3 rounded-3xl border border-secondary/70 bg-secondary/20 p-5 md:p-6" onSubmit={onSubmit}>
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

        <Button type="submit" disabled={submitting}>
          {submitting ? "Posting..." : "Post Job"}
        </Button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BadgeCheck, BookOpenCheck, Sparkles } from "lucide-react";

import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { updateStudentProfile } from "../api/student.api";

function splitCommaValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function StudentOnboardingPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [course, setCourse] = useState("");
  const [university, setUniversity] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const validateForm = () => {
    const errors: string[] = [];

    if (course.trim().length < 2) errors.push("Course is required");
    if (university.trim().length < 2) errors.push("University is required");
    if (year.trim().length < 1) errors.push("Year is required");
    if (semester.trim().length < 1) errors.push("Semester is required");
    if (bio.trim().length < 20) errors.push("Bio should be at least 20 characters");
    if (splitCommaValues(skills).length === 0) errors.push("At least one skill is required");

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
      await updateStudentProfile({
        course: course.trim(),
        university: university.trim(),
        year: year.trim(),
        semester: semester.trim(),
        bio: bio.trim(),
        skills: splitCommaValues(skills),
        portfolioLinks: splitCommaValues(portfolioLinks),
        resumeUrl: resumeUrl.trim(),
        isAvailable: true,
      });

      toast.success("Profile completed. Welcome to SkillNest!");
      navigate("/student/dashboard", { replace: true });
    } catch {
      toast.error("Unable to save profile details right now");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <section className="overflow-hidden rounded-3xl border border-secondary/70 bg-[linear-gradient(140deg,rgba(233,69,96,0.18),rgba(15,52,96,0.7))] p-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          <Sparkles size={14} /> First-Time Setup
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-white md:text-4xl">Build Your Portfolio Identity</h1>
        <p className="mt-2 max-w-2xl text-sm text-text/80">
          This one-time setup helps clients trust your profile and lets admin monitor student readiness. Fill accurate academic and skill details to unlock your dashboard.
        </p>
        <div className="mt-4 grid gap-2 text-xs text-text/75 md:grid-cols-3">
          <p className="rounded-xl border border-secondary/70 bg-primary/35 px-3 py-2"><BookOpenCheck className="mr-1 inline h-4 w-4" /> Academic details</p>
          <p className="rounded-xl border border-secondary/70 bg-primary/35 px-3 py-2"><BadgeCheck className="mr-1 inline h-4 w-4" /> Skill highlights</p>
          <p className="rounded-xl border border-secondary/70 bg-primary/35 px-3 py-2"><BadgeCheck className="mr-1 inline h-4 w-4" /> Portfolio links</p>
        </div>
      </section>

      <form className="space-y-4 rounded-3xl border border-secondary/70 bg-secondary/20 p-5 md:p-6" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Course"
            placeholder="B.Tech CSE"
            value={course}
            onChange={(event) => setCourse(event.target.value)}
          />
          <Input
            label="University"
            placeholder="Your university"
            value={university}
            onChange={(event) => setUniversity(event.target.value)}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Year"
            placeholder="3rd Year"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          />
          <Input
            label="Semester"
            placeholder="Semester 6"
            value={semester}
            onChange={(event) => setSemester(event.target.value)}
          />
        </div>

        <Input
          label="Skills"
          placeholder="React, Node.js, MongoDB"
          value={skills}
          onChange={(event) => setSkills(event.target.value)}
          hint="Enter comma-separated skills"
        />

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-text/90">Bio</span>
          <textarea
            className="min-h-[130px] rounded-xl border border-secondary/80 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-text/40 outline-none transition focus:border-accent"
            placeholder="Tell clients about your strengths, projects, and what kind of work you are best at."
            value={bio}
            onChange={(event) => setBio(event.target.value)}
          />
          <span className="text-xs text-text/60">Minimum 20 characters</span>
        </label>

        <Input
          label="Portfolio Links"
          placeholder="https://github.com/you, https://portfolio.site"
          value={portfolioLinks}
          onChange={(event) => setPortfolioLinks(event.target.value)}
          hint="Optional, comma-separated"
        />

        <Input
          label="Resume URL"
          placeholder="https://drive.google.com/..."
          value={resumeUrl}
          onChange={(event) => setResumeUrl(event.target.value)}
          hint="Optional"
        />

        <Button fullWidth type="submit" disabled={submitting}>
          {submitting ? "Saving Profile..." : "Complete Portfolio Setup"}
        </Button>
      </form>
    </div>
  );
}

import {
  BriefcaseBusiness,
  CircleDollarSign,
  GraduationCap,
  Laptop,
  Menu,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRoundSearch,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../../app/apiClient";
import { useAppSelector } from "../../../app/hooks";
import SkillNestLogo from "../../../shared/components/SkillNestLogo";
import { selectAuth } from "../../auth/authSlice";

const categories = [
  {
    title: "Web Development",
    description: "Landing pages, dashboards, and full-stack builds.",
    icon: Laptop,
  },
  {
    title: "Design & Branding",
    description: "UI kits, logo systems, and product identity.",
    icon: Sparkles,
  },
  {
    title: "Automation & Tools",
    description: "No-code workflows and custom utility scripts.",
    icon: Wrench,
  },
  {
    title: "Research & Strategy",
    description: "Competitor studies, user interviews, and reports.",
    icon: UserRoundSearch,
  },
];

const studentFlow = [
  {
    title: "Build a Credible Profile",
    copy: "Showcase skills, projects, and your learning journey.",
    icon: GraduationCap,
  },
  {
    title: "Bid on Real Projects",
    copy: "Apply to live client work that sharpens your portfolio.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Deliver and Get Paid",
    copy: "Complete milestones, earn reviews, and grow income.",
    icon: CircleDollarSign,
  },
];

const consumerFlow = [
  {
    title: "Post Your Requirement",
    copy: "Define scope, budget, and timeline in minutes.",
    icon: Rocket,
  },
  {
    title: "Pick from Verified Students",
    copy: "Compare bids, portfolios, ratings, and timelines.",
    icon: ShieldCheck,
  },
  {
    title: "Collaborate and Scale",
    copy: "Track progress via milestones and realtime chat.",
    icon: MessageSquare,
  },
];


type LandingTopStudent = {
  id: string;
  name: string;
  skill: string;
  university: string;
  rating: number;
  projects: number;
  earnings: number;
};

type LandingStatsResponse = {
  studentsBuildingPortfolios: number;
  projectsCompleted: number;
  paidToStudents: number;
  topStudents: LandingTopStudent[];
};

const testimonials = [
  {
    quote:
      "SkillNest helped us find a student developer who shipped our MVP in three weeks. The quality was honestly exceptional.",
    name: "Ritika Mehta",
    role: "Founder, DraftLoop",
  },
  {
    quote:
      "I got my first paid contract in my second semester and built a portfolio that actually got me internship calls.",
    name: "Naman Arora",
    role: "Computer Science Student",
  },
  {
    quote:
      "The escrow flow made hiring first-time freelancers feel safe and structured.",
    name: "Devansh Kapoor",
    role: "Consumer, Growth Consultant",
  },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAppSelector(selectAuth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [liveStats, setLiveStats] = useState<LandingStatsResponse>({
    studentsBuildingPortfolios: 0,
    projectsCompleted: 0,
    paidToStudents: 0,
    topStudents: [],
  });

  useEffect(() => {
    const load = async () => {
      setLoadingStats(true);
      try {
        const { data } = await api.get<LandingStatsResponse>("/users/platform-stats");
        setLiveStats(data);
      } catch {
        // Keep zero-state when backend stats are unavailable.
      } finally {
        setLoadingStats(false);
      }
    };

    load();
  }, []);

  const stats = [
    {
      label: "Students Building Portfolios",
      value: liveStats.studentsBuildingPortfolios.toLocaleString("en-IN"),
    },
    {
      label: "Projects Completed",
      value: liveStats.projectsCompleted.toLocaleString("en-IN"),
    },
    {
      label: "Paid to Students",
      value: `₹${liveStats.paidToStudents.toLocaleString("en-IN")}`,
    },
  ];

  const dashboardPath =
    user?.role === "student"
      ? "/student/dashboard"
      : user?.role === "consumer"
        ? "/consumer/dashboard"
        : user?.role === "admin"
          ? "/admin/dashboard"
          : "/register";

  return (
    <div className="min-h-screen overflow-x-hidden bg-primary text-text">
      <header className="sticky top-0 z-30 border-b border-secondary/70 bg-primary/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <SkillNestLogo />

          <nav className="hidden items-center gap-5 text-sm text-slate-600 lg:flex">
            <a href="#categories" className="transition hover:text-slate-900">
              Categories
            </a>
            <a href="#how-it-works" className="transition hover:text-slate-900">
              How It Works
            </a>
            <a href="#students" className="transition hover:text-slate-900">
              Students
            </a>
            <a href="#testimonials" className="transition hover:text-slate-900">
              Testimonials
            </a>
            <Link to="/register" className="transition hover:text-slate-900">
              Start Hiring
            </Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="rounded-xl border border-secondary px-4 py-2 text-sm font-semibold">
                  Login
                </Link>
                <Link to="/register" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white">
                  Join Now
                </Link>
              </>
            ) : (
              <Link to={dashboardPath} className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white">
                Go to Dashboard
              </Link>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-slate-200 bg-white/95 px-4 py-4 md:hidden">
            <nav className="grid gap-2 text-sm">
              <a
                href="#categories"
                className="rounded-lg px-3 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                Categories
              </a>
              <a
                href="#how-it-works"
                className="rounded-lg px-3 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#students"
                className="rounded-lg px-3 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                Students
              </a>
              <a
                href="#testimonials"
                className="rounded-lg px-3 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                Testimonials
              </a>
              <Link
                to="/register"
                className="rounded-lg px-3 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                Start Hiring
              </Link>
            </nav>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl border border-secondary px-4 py-2 text-center text-sm font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl bg-accent px-4 py-2 text-center text-sm font-semibold text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Join Now
                  </Link>
                </>
              ) : (
                <Link
                  to={dashboardPath}
                  className="col-span-2 rounded-xl bg-accent px-4 py-2 text-center text-sm font-semibold text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <section className="relative isolate border-b border-secondary/50">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(233,69,96,0.28),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(15,52,96,0.9),transparent_32%)]" />
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-6 md:py-24">
            <div>
              <p className="fade-up mb-4 inline-flex rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-semibold tracking-wide text-accent">
                Real Projects. Real Experience. Real Money.
              </p>
              <h1 className="fade-up animation-delay-1 font-heading text-4xl font-extrabold leading-tight text-white md:text-6xl">
                The Freelance Marketplace
                <span className="text-accent"> Built for Students.</span>
              </h1>
              <p className="fade-up animation-delay-2 mt-5 max-w-2xl text-base text-text/80 md:text-lg">
                SkillNest connects ambitious students with meaningful paid work from real consumers. Build portfolio depth, earn while learning, and graduate with proven experience.
              </p>

              <div className="fade-up animation-delay-3 mt-7 flex flex-wrap gap-3">
                <Link to="/register" className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent/30">
                  Sign Up as Student
                </Link>
                <Link to="/register" className="rounded-xl border border-secondary bg-secondary/25 px-5 py-3 text-sm font-bold text-text">
                  Post a Job as Consumer
                </Link>
              </div>
            </div>

            <div className="fade-up animation-delay-3 rounded-3xl border border-secondary/70 bg-secondary/25 p-5 shadow-2xl shadow-black/30">
              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <article key={stat.label} className="rounded-2xl border border-secondary/60 bg-black/15 p-4 text-center">
                    <p className="font-heading text-2xl font-bold text-accent">{loadingStats ? "..." : stat.value}</p>
                    <p className="mt-1 text-xs text-text/70">{stat.label}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-accent/35 bg-accent/10 p-4">
                <p className="text-sm text-text/90">
                  <TrendingUp className="mr-2 inline h-4 w-4 text-accent" />
                  Showing live platform numbers from current database state.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Featured Categories</p>
              <h2 className="font-heading text-3xl font-bold text-slate-900">Projects Students Love to Build</h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {categories.map((item) => (
              <article key={item.title} className="group rounded-2xl border border-secondary/60 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 transition hover:-translate-y-1 hover:border-accent/70 hover:shadow-md">
                <item.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-3 font-heading text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-y border-secondary/50 bg-secondary/20 py-14">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 md:grid-cols-2 md:px-6">
            <article>
              <h3 className="font-heading text-2xl font-bold text-slate-900">How It Works for Students</h3>
              <div className="mt-4 grid gap-3">
                {studentFlow.map((step, index) => (
                  <div key={step.title} className="rounded-2xl border border-secondary/60 bg-black/15 p-4">
                    <p className="text-xs font-semibold text-accent">Step {index + 1}</p>
                    <h4 className="mt-1 font-semibold text-slate-900"><step.icon className="mr-2 inline h-4 w-4" />{step.title}</h4>
                    <p className="mt-1 text-sm text-slate-700">{step.copy}</p>
                  </div>
                ))}
              </div>
            </article>

            <article>
              <h3 className="font-heading text-2xl font-bold text-slate-900">How It Works for Consumers</h3>
              <div className="mt-4 grid gap-3">
                {consumerFlow.map((step, index) => (
                  <div key={step.title} className="rounded-2xl border border-secondary/60 bg-black/15 p-4">
                    <p className="text-xs font-semibold text-accent">Step {index + 1}</p>
                    <h4 className="mt-1 font-semibold text-slate-900"><step.icon className="mr-2 inline h-4 w-4" />{step.title}</h4>
                    <p className="mt-1 text-sm text-slate-700">{step.copy}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section id="students" className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Live Leaderboard</p>
              <h2 className="font-heading text-3xl font-bold text-slate-900">Top Rated Talent</h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {loadingStats ? (
              <article className="rounded-2xl border border-secondary/60 bg-secondary/20 p-5 text-sm text-text/70">
                Loading live leaderboard...
              </article>
            ) : liveStats.topStudents.length ? (
              liveStats.topStudents.slice(0, 3).map((student) => (
                <article key={student.id} className="rounded-2xl border border-secondary/60 bg-secondary/20 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-xl font-semibold text-slate-900">{student.name}</h3>
                    <p className="text-sm font-semibold text-accent">{student.rating.toFixed(1)} <Star className="mb-0.5 inline h-4 w-4" /></p>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{student.skill}</p>
                  <p className="mt-1 text-xs text-slate-600">{student.university}</p>
                  <p className="mt-4 text-xs text-slate-600">{student.projects} completed projects • ₹{student.earnings.toLocaleString("en-IN")} earned</p>
                </article>
              ))
            ) : (
              <article className="rounded-2xl border border-secondary/60 bg-secondary/20 p-5 text-sm text-text/70 md:col-span-3">
                No ranked student data available yet.
              </article>
            )}
          </div>
        </section>

        <section className="border-y border-secondary/50 bg-[linear-gradient(120deg,rgba(15,52,96,0.95),rgba(26,26,46,0.95))]">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-14 text-center md:flex-row md:px-6 md:text-left">
            <div>
              <h2 className="font-heading text-3xl font-bold text-white">Ready to Build Your Career Before Graduation?</h2>
              <p className="mt-2 text-sm text-text/75">Whether you are a student looking for growth or a consumer seeking reliable execution, SkillNest is built for both.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white">Join as Student</Link>
              <Link to="/register" className="rounded-xl border border-secondary px-5 py-3 text-sm font-bold text-text">Post a Project</Link>
            </div>
          </div>
        </section>

        <section id="testimonials" className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Testimonials</p>
            <h2 className="font-heading text-3xl font-bold text-slate-900">What the Community Says</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-2xl border border-secondary/60 bg-secondary/20 p-5">
                <p className="text-sm text-slate-700">"{item.quote}"</p>
                <p className="mt-4 text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-600">{item.role}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-secondary/60 bg-secondary/25">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-text/70 md:flex-row md:items-center md:justify-between md:px-6">
          <p>© {new Date().getFullYear()} SkillNest. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="transition hover:text-white">Privacy</a>
            <a href="#" className="transition hover:text-white">Terms</a>
            <a href="#" className="transition hover:text-white">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

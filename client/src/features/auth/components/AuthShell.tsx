import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

interface AuthShellProps {
  title: string;
  subtitle: string;
}

export default function AuthShell({ title, subtitle, children }: PropsWithChildren<AuthShellProps>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-primary text-text">
      <div className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.65))]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 px-4 py-8 md:grid-cols-2 md:gap-8 md:px-8 md:py-12">
        <section className="hidden flex-col justify-between rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-sky-50 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:flex">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-accent/15 bg-accent/10 px-3 py-1 text-xs font-semibold tracking-wide text-accent">
              SkillNest
            </p>
            <h1 className="font-heading text-4xl font-bold leading-tight text-slate-900">
              Real Projects. Real Experience. Real Money.
            </h1>
            <p className="mt-4 max-w-md text-sm text-slate-600">
              A student-first freelance marketplace where portfolios, payments, and practical experience grow together.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xl font-bold text-accent">100%</p>
              <p className="text-slate-600">Student Focused</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xl font-bold text-accent">24/7</p>
              <p className="text-slate-600">Secure Escrow</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xl font-bold text-accent">Live</p>
              <p className="text-slate-600">Collaboration</p>
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-lg flex-col justify-center">
          <div className="mb-6">
            <Link to="/" className="font-heading text-2xl font-bold tracking-tight text-slate-900">
              SkillNest
            </Link>
            <h2 className="mt-6 font-heading text-3xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-8">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}

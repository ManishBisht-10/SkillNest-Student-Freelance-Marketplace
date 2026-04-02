import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

interface AuthShellProps {
  title: string;
  subtitle: string;
}

export default function AuthShell({ title, subtitle, children }: PropsWithChildren<AuthShellProps>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-primary text-text">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-surface/70 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 px-4 py-8 md:grid-cols-2 md:gap-8 md:px-8 md:py-12">
        <section className="hidden flex-col justify-between rounded-3xl border border-secondary/70 bg-gradient-to-br from-secondary to-surface p-8 md:flex">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-semibold tracking-wide text-accent">
              SkillNest
            </p>
            <h1 className="font-heading text-4xl font-bold leading-tight">
              Real Projects. Real Experience. Real Money.
            </h1>
            <p className="mt-4 max-w-md text-sm text-text/80">
              A student-first freelance marketplace where portfolios, payments, and practical experience grow together.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xl font-bold text-accent">100%</p>
              <p className="text-text/70">Student Focused</p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xl font-bold text-accent">24/7</p>
              <p className="text-text/70">Secure Escrow</p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <p className="text-xl font-bold text-accent">Live</p>
              <p className="text-text/70">Collaboration</p>
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-lg flex-col justify-center">
          <div className="mb-6">
            <Link to="/" className="font-heading text-2xl font-bold tracking-tight text-white">
              SkillNest
            </Link>
            <h2 className="mt-6 font-heading text-3xl font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm text-text/70">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-secondary/70 bg-black/20 p-6 backdrop-blur-sm md:p-8">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}

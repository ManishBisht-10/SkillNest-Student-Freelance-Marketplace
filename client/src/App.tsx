import { Toaster } from "sonner";

function App() {
  return (
    <div className="min-h-screen bg-surface text-text font-body">
      <Toaster position="top-right" richColors />
      <header className="border-b border-secondary bg-primary/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-accent" />
            <div className="flex flex-col">
              <span className="font-heading text-xl font-semibold tracking-tight">
                SkillNest
              </span>
              <span className="text-xs text-gray-300">
                Real Projects. Real Experience. Real Money.
              </span>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">
              Launch your{" "}
              <span className="text-accent">student freelance</span> career.
            </h1>
            <p className="max-w-xl text-sm text-gray-300 md:text-base">
              SkillNest connects ambitious students with real clients looking
              for fresh talent. Build a portfolio, earn money, and gain
              real-world experience&mdash;all before you graduate.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:translate-y-0.5 hover:bg-accent/90">
                Sign up as Student
              </button>
              <button className="rounded-lg border border-accent/40 bg-secondary/40 px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-secondary">
                Post a Job
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-secondary bg-primary/60 p-6 shadow-xl shadow-black/30">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-surface p-4 text-center">
                <p className="text-2xl font-semibold text-accent">0</p>
                <p className="text-xs text-gray-300">Students</p>
              </div>
              <div className="rounded-xl bg-surface p-4 text-center">
                <p className="text-2xl font-semibold text-accent">0</p>
                <p className="text-xs text-gray-300">Jobs Completed</p>
              </div>
              <div className="rounded-xl bg-surface p-4 text-center">
                <p className="text-2xl font-semibold text-accent">₹0</p>
                <p className="text-xs text-gray-300">Total Earned</p>
              </div>
            </div>
            <p className="mt-6 text-xs text-gray-400">
              This is a starter UI for SkillNest. We&apos;ll wire real data,
              dashboards, and role-based flows in the next steps.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;


import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  Database,
  LayoutDashboard,
  MessageCircleWarning,
  ScrollText,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import Button from "../../../shared/components/Button";
import { logoutThunk, selectAuth } from "../../auth/authSlice";

const navItems = [
  { to: "/admin/dashboard", label: "Command Center", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { to: "/admin/contracts", label: "Contracts", icon: ScrollText },
  { to: "/admin/disputes", label: "Disputes", icon: MessageCircleWarning },
  { to: "/admin/transactions", label: "Transactions", icon: BadgeIndianRupee },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/database", label: "Database Explorer", icon: Database },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);

  const onLogout = async () => {
    await dispatch(logoutThunk());
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-primary text-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(233,69,96,0.24),transparent_35%),radial-gradient(circle_at_88%_0%,rgba(15,52,96,0.92),transparent_43%),radial-gradient(circle_at_50%_105%,rgba(22,33,62,0.9),transparent_48%)]" />

      <header className="sticky top-0 z-20 border-b border-secondary/80 bg-primary/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20 text-accent">
              <ShieldCheck size={20} />
            </div>
            <div>
              <Link to="/" className="font-heading text-lg font-bold tracking-tight text-white md:text-xl">
                SkillNest Admin Nexus
              </Link>
              <p className="text-xs uppercase tracking-[0.2em] text-text/55">Control Plane</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-xl border border-secondary/70 bg-secondary/40 px-3 py-1.5 text-right text-xs md:block">
              <p className="font-semibold text-white">{user?.name || "Admin"}</p>
              <p className="text-text/65">{user?.email || "admin@skillnest.local"}</p>
            </div>
            <Button variant="secondary" onClick={onLogout}>
              Secure Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-[260px_minmax(0,1fr)] md:px-6">
        <aside className="rounded-3xl border border-secondary/70 bg-secondary/30 p-3 shadow-2xl shadow-black/20 backdrop-blur md:sticky md:top-24 md:h-fit">
          <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-text/55">Navigation</p>
          <nav className="flex gap-1 overflow-x-auto md:grid md:overflow-visible">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group inline-flex min-w-max items-center gap-2 whitespace-nowrap rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-accent text-white shadow-lg shadow-accent/30"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <item.icon size={16} className="opacity-85 transition group-hover:opacity-100" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 rounded-2xl border border-secondary/80 bg-primary/45 p-3 text-xs text-text/70">
            <p className="font-semibold text-white">Live Governance</p>
            <p className="mt-1">Monitor users, jobs, contracts, payments, and moderation queues in one place.</p>
          </div>
        </aside>

        <main className="rounded-3xl border border-secondary/70 bg-primary/35 p-4 shadow-2xl shadow-black/20 backdrop-blur md:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

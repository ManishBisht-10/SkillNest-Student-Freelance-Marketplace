import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import Button from "../../../shared/components/Button";
import { logoutThunk, selectAuth } from "../../auth/authSlice";

const navItems = [
  { to: "/student/dashboard", label: "Dashboard" },
  { to: "/student/jobs", label: "Jobs" },
  { to: "/student/bids", label: "Bids" },
  { to: "/student/contracts", label: "Contracts" },
  { to: "/student/chat", label: "Chat" },
];

export default function StudentLayout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);

  const onLogout = async () => {
    await dispatch(logoutThunk());
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-primary text-text">
      <header className="sticky top-0 z-20 border-b border-secondary/80 bg-primary/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="font-heading text-xl font-bold tracking-tight">
            SkillNest
          </Link>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-text/70 md:block">
              {user?.name || "Student"}
            </p>
            <Button variant="secondary" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-[220px_minmax(0,1fr)] md:px-6">
        <aside className="overflow-x-auto rounded-2xl border border-secondary/70 bg-secondary/20 p-2 md:h-fit md:overflow-visible">
          <nav className="flex gap-1 md:grid">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-accent text-white"
                      : "text-text/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

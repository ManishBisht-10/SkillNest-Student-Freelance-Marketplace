import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { listAdminUsers, setUserActive, setUserBanned } from "../api/admin.api";
import AdminPageSkeleton from "../components/AdminPageSkeleton";
import type { AdminUser } from "../types/admin";

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await listAdminUsers({
        role: (role || undefined) as "admin" | "student" | "consumer" | undefined,
        status: (status || undefined) as "active" | "inactive" | "banned" | undefined,
        q: q.trim() || undefined,
      });
      setUsers(response);
    } catch {
      toast.error("Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => users, [users]);

  const onToggleBan = async (user: AdminUser) => {
    try {
      const response = await setUserBanned(user._id, !user.isBanned);
      setUsers((prev) => prev.map((item) => (item._id === user._id ? response.user : item)));
      toast.success(response.message);
    } catch {
      toast.error("Unable to update ban status");
    }
  };

  const onToggleActive = async (user: AdminUser) => {
    try {
      const response = await setUserActive(user._id, !user.isActive);
      setUsers((prev) => prev.map((item) => (item._id === user._id ? response.user : item)));
      toast.success(response.message);
    } catch {
      toast.error("Unable to update active status");
    }
  };

  if (loading) return <AdminPageSkeleton />;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5">
        <h1 className="font-heading text-3xl font-bold">Manage Users</h1>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Input label="Search" placeholder="Name or email" value={q} onChange={(e) => setQ(e.target.value)} />
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-text/90">Role</span>
            <select className="h-11 rounded-xl border border-secondary/80 bg-white/5 px-3 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
              <option value="consumer">Consumer</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-text/90">Status</span>
            <select className="h-11 rounded-xl border border-secondary/80 bg-white/5 px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button fullWidth onClick={loadUsers}>Apply Filters</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        {filteredUsers.map((user) => (
          <article key={user._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-semibold text-white">{user.name}</h2>
                <p className="text-sm text-text/70">{user.email}</p>
                <p className="mt-1 text-xs text-text/60">{user.role} • Joined {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => onToggleBan(user)}>
                  {user.isBanned ? "Unban" : "Ban"}
                </Button>
                <Button variant="ghost" onClick={() => onToggleActive(user)}>
                  {user.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, UserCheck, UserX, Users } from "lucide-react";

import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { deleteAdminUser, listAdminUsers, setUserActive, setUserBanned } from "../api/admin.api";
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
  const activeUsers = filteredUsers.filter((user) => user.isActive && !user.isBanned).length;
  const bannedUsers = filteredUsers.filter((user) => user.isBanned).length;
  const unverifiedUsers = filteredUsers.filter((user) => !user.isVerified).length;

  const roleCounts = filteredUsers.reduce(
    (acc, user) => {
      acc[user.role] += 1;
      return acc;
    },
    { admin: 0, student: 0, consumer: 0 }
  );

  const statusPillClass = (user: AdminUser) => {
    if (user.isBanned) return "border-red-400/35 bg-red-500/15 text-red-200";
    if (!user.isActive) return "border-amber-400/35 bg-amber-500/15 text-amber-200";
    return "border-emerald-400/35 bg-emerald-500/15 text-emerald-200";
  };

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

  const onRemoveUser = async (user: AdminUser) => {
    const confirmed = window.confirm(`Remove ${user.name}? This will delete the account and related data.`);
    if (!confirmed) return;

    try {
      const response = await deleteAdminUser(user._id);
      setUsers((prev) => prev.filter((item) => item._id !== user._id));
      toast.success(response.message);
    } catch {
      toast.error("Unable to remove user");
    }
  };

  if (loading) return <AdminPageSkeleton />;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-secondary/70 bg-[linear-gradient(140deg,rgba(233,69,96,0.16),rgba(15,52,96,0.68))] p-5">
        <h1 className="font-heading text-3xl font-bold text-white">User Governance</h1>
        <p className="mt-1 text-sm text-white/75">Search, segment, and moderate user accounts across all roles.</p>
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

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Total In View</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><Users size={18} /> {filteredUsers.length}</p>
          <p className="text-xs text-text/60">Admins {roleCounts.admin}, Students {roleCounts.student}, Consumers {roleCounts.consumer}</p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Active Accounts</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><UserCheck size={18} /> {activeUsers}</p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Banned Accounts</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><UserX size={18} /> {bannedUsers}</p>
        </article>
        <article className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
          <p className="text-xs uppercase tracking-wide text-text/60">Unverified</p>
          <p className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-white"><ShieldCheck size={18} /> {unverifiedUsers}</p>
        </article>
      </section>

      <section className="grid gap-3">
        {filteredUsers.length ? (
          filteredUsers.map((user) => (
            <article key={user._id} className="rounded-2xl border border-secondary/70 bg-secondary/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-white">{user.name}</h2>
                  <p className="text-sm text-text/70">{user.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-secondary/80 bg-primary/45 px-2.5 py-1 uppercase tracking-wide text-text/75">{user.role}</span>
                    <span className={`rounded-full border px-2.5 py-1 font-medium ${statusPillClass(user)}`}>
                      {user.isBanned ? "Banned" : user.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="rounded-full border border-secondary/80 bg-primary/45 px-2.5 py-1 text-text/75">
                      {user.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-text/60">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => onToggleBan(user)}>
                    {user.isBanned ? "Unban" : "Ban"}
                  </Button>
                  <Button variant="ghost" onClick={() => onToggleActive(user)}>
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  {user.role !== "admin" ? (
                    <Button variant="ghost" onClick={() => onRemoveUser(user)} className="text-red-300 hover:bg-red-500/10 hover:text-red-200">
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-secondary/70 bg-secondary/20 p-5 text-sm text-text/70">
            No users found for current filters.
          </div>
        )}
      </section>
    </div>
  );
}

import { api } from "../../../app/apiClient";
import type {
  AdminContract,
  AdminDashboardStats,
  AdminJob,
  AdminReview,
  AdminStudentProfile,
  AdminTransaction,
  AdminUser,
} from "../types/admin";

export async function getAdminDashboardStats() {
  const { data } = await api.get<AdminDashboardStats>("/admin/dashboard");
  return data;
}

export async function listAdminUsers(params?: {
  role?: "admin" | "student" | "consumer";
  status?: "active" | "inactive" | "banned";
  q?: string;
}) {
  const { data } = await api.get<AdminUser[]>("/admin/users", { params });
  return data;
}

export async function setUserBanned(userId: string, banned: boolean) {
  const { data } = await api.put<{ message: string; user: AdminUser }>(`/admin/users/${userId}/ban`, {
    banned,
  });
  return data;
}

export async function setUserActive(userId: string, active: boolean) {
  const { data } = await api.put<{ message: string; user: AdminUser }>(`/admin/users/${userId}/activate`, {
    active,
  });
  return data;
}

export async function deleteAdminUser(userId: string) {
  const { data } = await api.delete<{ message: string; user: AdminUser }>(`/admin/users/${userId}`);
  return data;
}

export async function listAdminJobs(status?: string) {
  const { data } = await api.get<AdminJob[]>("/admin/jobs", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function deleteAdminJob(jobId: string) {
  const { data } = await api.delete<{ message: string; id: string }>(`/admin/jobs/${jobId}`);
  return data;
}

export async function listAdminContracts() {
  const { data } = await api.get<AdminContract[]>("/admin/contracts");
  return data;
}

export async function listAdminDisputes() {
  const { data } = await api.get<AdminContract[]>("/admin/disputes");
  return data;
}

export async function resolveAdminDispute(contractId: string, decision: "release" | "refund") {
  const { data } = await api.put<{ message: string; contract: AdminContract }>(
    `/admin/disputes/${contractId}/resolve`,
    { decision }
  );
  return data;
}

export async function listAdminTransactions(params?: {
  type?: "payment" | "release" | "refund";
  status?: string;
}) {
  const { data } = await api.get<AdminTransaction[]>("/admin/transactions", {
    params,
  });
  return data;
}

export async function listAdminReviews() {
  const { data } = await api.get<AdminReview[]>("/admin/reviews");
  return data;
}

export async function deleteAdminReview(reviewId: string) {
  const { data } = await api.delete<{ message: string; id: string }>(`/admin/reviews/${reviewId}`);
  return data;
}

export async function listAdminStudentProfiles() {
  const { data } = await api.get<AdminStudentProfile[]>("/admin/student-profiles");
  return data;
}

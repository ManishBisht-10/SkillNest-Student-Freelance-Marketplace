import { api } from "../../../app/apiClient";
import type {
  Bid,
  ChatMessage,
  ChatRoom,
  ConsumerProfile,
  Contract,
  Job,
  JobsListResponse,
  Notification,
  UserMeConsumerResponse,
} from "../types/consumer";

export async function getConsumerProfile() {
  const { data } = await api.get<UserMeConsumerResponse>("/users/me");
  return data;
}

export async function updateConsumerProfile(payload: {
  name?: string;
  companyName?: string;
  website?: string;
}) {
  const { data } = await api.put<{ user: unknown; profile: ConsumerProfile }>("/users/me", payload);
  return data;
}

export async function createJob(payload: {
  title: string;
  description: string;
  category: string;
  skillsRequired: string[];
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  attachments?: string[];
}) {
  const { data } = await api.post<Job>("/jobs", payload);
  return data;
}

export async function listMyJobs() {
  const { data } = await api.get<Job[]>("/jobs/my/posted");
  return data;
}

export async function getJobById(jobId: string) {
  const { data } = await api.get<Job>(`/jobs/${jobId}`);
  return data;
}

export async function listJobs(params?: {
  category?: string;
  status?: string;
  minBudget?: number;
  maxBudget?: number;
  skills?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<JobsListResponse>("/jobs", { params });
  return data;
}

export async function updateJob(jobId: string, payload: Partial<Omit<Job, "_id" | "postedBy" | "createdAt" | "updatedAt">>) {
  const { data } = await api.put<Job>(`/jobs/${jobId}`, payload);
  return data;
}

export async function cancelJob(jobId: string) {
  const { data } = await api.delete<Job>(`/jobs/${jobId}`);
  return data;
}

export async function getBidsForJob(jobId: string) {
  const { data } = await api.get<Bid[]>(`/bids/job/${jobId}`);
  return data;
}

export async function acceptBid(bidId: string) {
  const { data } = await api.put<{ message: string; contract: Contract; chatRoom: ChatRoom }>(`/bids/${bidId}/accept`);
  return data;
}

export async function rejectBid(bidId: string) {
  const { data } = await api.put<Bid>(`/bids/${bidId}/reject`);
  return data;
}

export async function initiateEscrowPayment(contractId: string) {
  const { data } = await api.post<{
    keyId: string;
    orderId: string;
    amount: number;
    currency: string;
    contractId: string;
  }>("/payments/initiate", { contractId });
  return data;
}

export async function getMyContracts() {
  const { data } = await api.get<Contract[]>("/contracts/my");
  return data;
}

export async function approveContract(contractId: string) {
  const { data } = await api.put<{ message: string; contract: Contract }>(`/contracts/${contractId}/approve`);
  return data;
}

export async function getNotifications() {
  const { data } = await api.get<Notification[]>("/notifications");
  return data;
}

export async function getChatRooms() {
  const { data } = await api.get<ChatRoom[]>("/chat/rooms");
  return data;
}

export async function getChatRoomMessages(roomId: string, page = 1, limit = 30) {
  const { data } = await api.get<{ items: ChatMessage[] }>(`/chat/rooms/${roomId}`, {
    params: { page, limit },
  });
  return data;
}

export async function sendRoomMessage(roomId: string, payload: { text?: string; attachmentUrl?: string }) {
  const { data } = await api.post<ChatMessage>(`/chat/rooms/${roomId}/messages`, payload);
  return data;
}

export async function uploadChatAttachment(roomId: string, file: File) {
  const form = new FormData();
  form.append("file", file);

  const { data } = await api.post<{ attachmentUrl: string }>(`/chat/rooms/${roomId}/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

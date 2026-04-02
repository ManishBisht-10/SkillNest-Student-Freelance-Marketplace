import { api } from "../../../app/apiClient";
import type {
  Bid,
  ChatMessage,
  ChatRoom,
  Contract,
  Job,
  Notification,
  PagedChatMessages,
  StudentProfile,
} from "../types/student";

interface JobsListResponse {
  page: number;
  limit: number;
  total: number;
  items: Job[];
}

export async function getStudentProfile() {
  const { data } = await api.get<{ user: unknown; profile: StudentProfile | null }>("/users/me");
  return data;
}

export async function listOpenJobs(params?: {
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  skills?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<JobsListResponse>("/jobs", {
    params: {
      status: "open",
      ...params,
    },
  });
  return data;
}

export async function getJobById(jobId: string) {
  const { data } = await api.get<Job>(`/jobs/${jobId}`);
  return data;
}

export async function submitBid(payload: {
  jobId: string;
  proposalText: string;
  bidAmount: number;
  deliveryDays: number;
}) {
  const { data } = await api.post<Bid>("/bids", payload);
  return data;
}

export async function getMyBids() {
  const { data } = await api.get<Bid[]>("/bids/my");
  return data;
}

export async function getMyContracts() {
  const { data } = await api.get<Contract[]>("/contracts/my");
  return data;
}

export async function completeMilestone(contractId: string, milestoneId: string) {
  const { data } = await api.put<Contract>(`/contracts/${contractId}/milestone/${milestoneId}/complete`);
  return data;
}

export async function submitContractCompletion(contractId: string) {
  const { data } = await api.put<{ message: string; contract: Contract }>(`/contracts/${contractId}/complete`);
  return data;
}

export async function getNotifications() {
  const { data } = await api.get<Notification[]>("/notifications");
  return data;
}

export async function getStudentAssignedJobs() {
  const { data } = await api.get<Job[]>("/jobs/my/assigned");
  return data;
}

export async function getChatRooms() {
  const { data } = await api.get<ChatRoom[]>("/chat/rooms");
  return data;
}

export async function getChatRoomMessages(roomId: string, page = 1, limit = 30) {
  const { data } = await api.get<PagedChatMessages>(`/chat/rooms/${roomId}`, {
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

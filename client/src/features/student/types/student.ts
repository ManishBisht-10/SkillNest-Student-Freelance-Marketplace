export interface StudentProfile {
  userId: string;
  bio: string;
  skills: string[];
  university: string;
  year: string;
  portfolioLinks: string[];
  rating: number;
  totalEarnings: number;
  completedJobs: number;
  resumeUrl: string;
  isAvailable: boolean;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  skillsRequired: string[];
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  status: "open" | "in-progress" | "completed" | "cancelled" | "disputed";
  postedBy: {
    _id: string;
    name: string;
    role: string;
  };
  attachments: string[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  _id: string;
  jobId: string | Job;
  studentId: string;
  proposalText: string;
  bidAmount: number;
  deliveryDays: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface ContractMilestone {
  _id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
}

export interface Contract {
  _id: string;
  jobId: string | Job;
  studentId: string;
  consumerId: string;
  agreedAmount: number;
  startDate: string;
  endDate: string;
  milestones: ContractMilestone[];
  status: "active" | "completed" | "disputed" | "cancelled";
  paymentStatus: "pending" | "held" | "released" | "refunded";
  completionSubmittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  type: "bid" | "job" | "chat" | "payment" | "system";
  isRead: boolean;
  link: string;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  contractId: {
    _id: string;
    jobId?: {
      _id: string;
      title: string;
      category: string;
      status: string;
    };
  };
  participants: Array<{
    _id: string;
    name: string;
    avatar: string;
    role: string;
  }>;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  chatRoomId: string;
  senderId: {
    _id: string;
    name: string;
    avatar: string;
    role: string;
  };
  text: string;
  attachmentUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface PagedChatMessages {
  room: ChatRoom;
  page: number;
  limit: number;
  total: number;
  items: ChatMessage[];
}

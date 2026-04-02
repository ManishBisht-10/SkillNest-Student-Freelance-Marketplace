import type {
  Bid as StudentBid,
  ChatMessage,
  ChatRoom,
  Contract,
  Job,
  Notification,
} from "../../student/types/student";

export type { ChatMessage, ChatRoom, Contract, Job, Notification };

export interface Bid extends Omit<StudentBid, "studentId"> {
  studentId:
    | string
    | {
        _id: string;
        name: string;
        avatar: string;
        role: string;
      };
}

export interface ConsumerProfile {
  userId: string;
  companyName: string;
  website: string;
  totalJobsPosted: number;
  rating: number;
}

export interface UserMeConsumerResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: "consumer";
    avatar: string;
  };
  profile: ConsumerProfile | null;
}

export interface JobsListResponse {
  page: number;
  limit: number;
  total: number;
  items: Job[];
}

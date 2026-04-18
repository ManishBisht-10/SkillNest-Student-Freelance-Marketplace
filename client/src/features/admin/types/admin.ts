import type { Contract, Job } from "../../student/types/student";

export interface AdminDashboardStats {
  totalUsers: number;
  usersByRole: {
    admin: number;
    student: number;
    consumer: number;
  };
  totalJobs: number;
  totalRevenue: number;
  activeContracts: number;
  disputes: number;
  newSignupsToday: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "student" | "consumer";
  avatar: string;
  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface AdminJob extends Job {
  postedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AdminContract {
  _id: string;
  jobId:
    | string
    | {
        _id: string;
        title: string;
        status: string;
      };
  studentId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  consumerId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  agreedAmount: number;
  status: "active" | "completed" | "disputed" | "cancelled";
  paymentStatus: "pending" | "held" | "released" | "refunded";
  createdAt: string;
  updatedAt: string;
}

export interface AdminTransaction {
  _id: string;
  contractId:
    | string
    | {
        _id: string;
        jobId: string;
        agreedAmount: number;
        status: string;
      };
  amount: number;
  type: "payment" | "release" | "refund";
  paymentGatewayId: string;
  status: string;
  createdAt: string;
}

export interface AdminReview {
  _id: string;
  reviewerId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        role: string;
      };
  revieweeId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        role: string;
      };
  contractId: string | { _id: string };
  rating: number;
  comment: string;
  role: "student" | "consumer";
  createdAt: string;
}

export interface AdminStudentProfile {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        role: string;
        isVerified: boolean;
        isActive: boolean;
        isBanned: boolean;
      };
  bio: string;
  skills: string[];
  course: string;
  university: string;
  year: string;
  semester: string;
  portfolioLinks: string[];
  rating: number;
  totalEarnings: number;
  completedJobs: number;
  resumeUrl: string;
  isAvailable: boolean;
  updatedAt: string;
}

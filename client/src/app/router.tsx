import type { ReactElement } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import VerifyOtpPage from "../features/auth/pages/VerifyOtpPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import StudentLayout from "../features/student/components/StudentLayout";
import StudentDashboardPage from "../features/student/pages/StudentDashboardPage";
import StudentJobsPage from "../features/student/pages/StudentJobsPage";
import StudentJobDetailsPage from "../features/student/pages/StudentJobDetailsPage";
import StudentBidsPage from "../features/student/pages/StudentBidsPage";
import StudentContractsPage from "../features/student/pages/StudentContractsPage";
import StudentChatPage from "../features/student/pages/StudentChatPage";
import ConsumerLayout from "../features/consumer/components/ConsumerLayout";
import ConsumerDashboardPage from "../features/consumer/pages/ConsumerDashboardPage";
import ConsumerPostJobPage from "../features/consumer/pages/ConsumerPostJobPage";
import ConsumerJobsPage from "../features/consumer/pages/ConsumerJobsPage";
import ConsumerJobDetailsPage from "../features/consumer/pages/ConsumerJobDetailsPage";
import ConsumerContractsPage from "../features/consumer/pages/ConsumerContractsPage";
import ConsumerChatPage from "../features/consumer/pages/ConsumerChatPage";
import ConsumerProfilePage from "../features/consumer/pages/ConsumerProfilePage";
import AdminLayout from "../features/admin/components/AdminLayout";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import AdminUsersPage from "../features/admin/pages/AdminUsersPage";
import AdminJobsPage from "../features/admin/pages/AdminJobsPage";
import AdminContractsPage from "../features/admin/pages/AdminContractsPage";
import AdminDisputesPage from "../features/admin/pages/AdminDisputesPage";
import AdminTransactionsPage from "../features/admin/pages/AdminTransactionsPage";
import AdminReviewsPage from "../features/admin/pages/AdminReviewsPage";
import LandingPage from "../features/landing/pages/LandingPage";
import { useAppSelector } from "./hooks";
import { selectAuth } from "../features/auth/authSlice";

function AuthOnlyRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, initialized, user } = useAppSelector(selectAuth);

  if (!initialized) {
    return (
      <div className="grid min-h-screen place-items-center bg-primary text-text">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function RoleRoute({ role, children }: { role: "student" | "consumer" | "admin"; children: ReactElement }) {
  const { user } = useAppSelector(selectAuth);
  if (!user || user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/student"
        element={
          <AuthOnlyRoute>
            <RoleRoute role="student">
              <StudentLayout />
            </RoleRoute>
          </AuthOnlyRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="jobs" element={<StudentJobsPage />} />
        <Route path="jobs/:id" element={<StudentJobDetailsPage />} />
        <Route path="bids" element={<StudentBidsPage />} />
        <Route path="contracts" element={<StudentContractsPage />} />
        <Route path="chat" element={<StudentChatPage />} />
        <Route index element={<Navigate to="/student/dashboard" replace />} />
      </Route>

      <Route
        path="/consumer"
        element={
          <AuthOnlyRoute>
            <RoleRoute role="consumer">
              <ConsumerLayout />
            </RoleRoute>
          </AuthOnlyRoute>
        }
      >
        <Route path="dashboard" element={<ConsumerDashboardPage />} />
        <Route path="post-job" element={<ConsumerPostJobPage />} />
        <Route path="jobs" element={<ConsumerJobsPage />} />
        <Route path="jobs/:id" element={<ConsumerJobDetailsPage />} />
        <Route path="contracts" element={<ConsumerContractsPage />} />
        <Route path="chat" element={<ConsumerChatPage />} />
        <Route path="profile" element={<ConsumerProfilePage />} />
        <Route index element={<Navigate to="/consumer/dashboard" replace />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AuthOnlyRoute>
            <RoleRoute role="admin">
              <AdminLayout />
            </RoleRoute>
          </AuthOnlyRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="jobs" element={<AdminJobsPage />} />
        <Route path="contracts" element={<AdminContractsPage />} />
        <Route path="disputes" element={<AdminDisputesPage />} />
        <Route path="transactions" element={<AdminTransactionsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

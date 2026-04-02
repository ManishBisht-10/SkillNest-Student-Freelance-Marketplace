import { api } from "../../../app/apiClient";
import type {
  AuthSuccessResponse,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyOtpInput,
} from "../../../shared/types/auth";

export async function register(payload: RegisterInput) {
  const { data } = await api.post<{ message: string }>("/auth/register", payload);
  return data;
}

export async function verifyOtp(payload: VerifyOtpInput) {
  const { data } = await api.post<AuthSuccessResponse>("/auth/verify-otp", payload);
  return data;
}

export async function resendOtp(email: string) {
  const { data } = await api.post<{ message: string }>("/auth/resend-otp", { email });
  return data;
}

export async function login(payload: LoginInput) {
  const { data } = await api.post<AuthSuccessResponse>("/auth/login", payload);
  return data;
}

export async function forgotPassword(payload: ForgotPasswordInput) {
  const { data } = await api.post<{ message: string }>("/auth/forgot-password", payload);
  return data;
}

export async function resetPassword(payload: ResetPasswordInput) {
  const { data } = await api.post<{ message: string }>("/auth/reset-password", payload);
  return data;
}

export async function logout(refreshToken: string | null) {
  const { data } = await api.post<{ message: string }>("/auth/logout", {
    refreshToken,
  });
  return data;
}

export async function getMe() {
  const { data } = await api.get<{ user: Record<string, unknown> }>("/users/me");
  return data;
}

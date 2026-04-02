export type UserRole = "admin" | "student" | "consumer";

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  avatar: string;
  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
}

export interface AuthSuccessResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "admin">;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}

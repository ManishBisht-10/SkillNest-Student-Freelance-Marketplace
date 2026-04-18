import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../../app/storage";
import type { AppDispatch, RootState } from "../../app/store";
import type {
  AuthSuccessResponse,
  AuthUser,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyOtpInput,
} from "../../shared/types/auth";
import {
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resendOtp,
  resetPassword,
  verifyOtp,
} from "./api/auth.api";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  pendingOtpEmail: string;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: Boolean(getAccessToken()),
  loading: false,
  initialized: false,
  pendingOtpEmail: "",
  error: null,
};

function mapToAuthUser(raw: Record<string, unknown>): AuthUser {
  return {
    id: String(raw._id || raw.id || ""),
    role: (raw.role as AuthUser["role"]) || "student",
    name: String(raw.name || ""),
    email: String(raw.email || ""),
    avatar: String(raw.avatar || ""),
    isVerified: Boolean(raw.isVerified),
    isActive: Boolean(raw.isActive),
    isBanned: Boolean(raw.isBanned),
  };
}

function setAuthTokens(payload: AuthSuccessResponse) {
  setTokens(payload.accessToken, payload.refreshToken);
}

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload: RegisterInput) => {
    const response = await register(payload);
    return { ...response, email: payload.email };
  }
);

export const verifyOtpThunk = createAsyncThunk(
  "auth/verifyOtp",
  async (payload: VerifyOtpInput, { dispatch }) => {
    const response = await verifyOtp(payload);
    setAuthTokens(response);
    const user = await dispatch(fetchMeThunk()).unwrap();
    return { ...response, user };
  }
);

export const resendOtpThunk = createAsyncThunk(
  "auth/resendOtp",
  async (email: string) => {
    const response = await resendOtp(email);
    return response;
  }
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: LoginInput, { dispatch }) => {
    const response = await login(payload);
    setAuthTokens(response);
    const user = await dispatch(fetchMeThunk()).unwrap();
    return { ...response, user };
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  "auth/forgotPassword",
  async (payload: ForgotPasswordInput) => {
    const response = await forgotPassword(payload);
    return response;
  }
);

export const resetPasswordThunk = createAsyncThunk(
  "auth/resetPassword",
  async (payload: ResetPasswordInput) => {
    const response = await resetPassword(payload);
    return response;
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async () => {
    const refreshToken = getRefreshToken();
    await logout(refreshToken || null);
    clearTokens();
    return true;
  }
);

export const fetchMeThunk = createAsyncThunk("auth/fetchMe", async () => {
  const response = await getMe();
  return response.user;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setPendingOtpEmail(state, action: PayloadAction<string>) {
      state.pendingOtpEmail = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
    markAuthInitialized(state) {
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingOtpEmail = action.payload.email;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Registration failed";
      })
      .addCase(verifyOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload.user as AuthUser;
        state.isAuthenticated = true;
        state.pendingOtpEmail = "";
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "OTP verification failed";
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.initialized = true;
        state.user = action.payload.user as AuthUser;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      })
      .addCase(fetchMeThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = mapToAuthUser(action.payload as Record<string, unknown>);
        state.isAuthenticated = true;
      })
      .addCase(fetchMeThunk.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setPendingOtpEmail, clearAuthError, markAuthInitialized } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;

export const initializeAuth = () => async (dispatch: AppDispatch) => {
  const token = getAccessToken();
  if (!token) {
    dispatch(markAuthInitialized());
    return;
  }
  const result = await dispatch(fetchMeThunk());
  if (fetchMeThunk.rejected.match(result)) {
    clearTokens();
  }
};

export default authSlice.reducer;

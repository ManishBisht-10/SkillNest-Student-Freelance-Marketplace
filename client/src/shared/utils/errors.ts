import axios from "axios";

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ||
      error.message;
    if (message && typeof message === "string") return message;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}

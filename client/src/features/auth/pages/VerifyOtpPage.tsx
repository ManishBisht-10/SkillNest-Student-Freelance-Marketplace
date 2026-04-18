import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { getErrorMessage } from "../../../shared/utils/errors";
import { resendOtpThunk, selectAuth, setPendingOtpEmail, verifyOtpThunk } from "../authSlice";
import AuthShell from "../components/AuthShell";

function getPostLoginPath(role?: string) {
  if (role === "student") return "/student/dashboard";
  if (role === "consumer") return "/consumer/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/";
}

export default function VerifyOtpPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, pendingOtpEmail } = useAppSelector(selectAuth);

  const [email, setEmail] = useState(pendingOtpEmail || "");
  const [otp, setOtp] = useState("");

  const otpValid = useMemo(() => /^\d{6}$/.test(otp), [otp]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await dispatch(
        verifyOtpThunk({
          email: email.trim().toLowerCase(),
          otp,
        })
      ).unwrap();
      toast.success("Email verified successfully");
      navigate(getPostLoginPath((response.user as { role?: string })?.role), { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid or expired OTP"));
    }
  };

  const onResend = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      toast.error("Enter a valid email first");
      return;
    }

    try {
      const response = await dispatch(resendOtpThunk(normalizedEmail)).unwrap();
      dispatch(setPendingOtpEmail(normalizedEmail));
      if (response.otpPreview) {
        toast.success(`SMTP issue detected. Use OTP: ${response.otpPreview}`);
      } else {
        toast.success("OTP resent");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to resend OTP right now"));
    }
  };

  return (
    <AuthShell title="Verify your email" subtitle="Enter the 6-digit OTP sent to your inbox.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="OTP Code"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          hint="Valid for 10 minutes"
        />

        <Button fullWidth type="submit" disabled={!otpValid || loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="flex items-center justify-between">
          <button type="button" onClick={onResend} className="text-sm font-semibold text-accent">
            Resend OTP
          </button>
          <Link className="text-sm text-text/70" to="/login">
            Back to login
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

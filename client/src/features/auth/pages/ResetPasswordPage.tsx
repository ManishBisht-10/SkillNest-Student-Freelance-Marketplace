import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { resetPasswordThunk, selectAuth } from "../authSlice";
import AuthShell from "../components/AuthShell";

export default function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector(selectAuth);
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const isValid = useMemo(() => {
    return email.includes("@") && /^\d{6}$/.test(otp) && newPassword.length >= 8;
  }, [email, otp, newPassword]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await dispatch(
        resetPasswordThunk({
          email: email.trim().toLowerCase(),
          otp,
          newPassword,
        })
      ).unwrap();

      toast.success("Password reset successful. Please login.");
      navigate("/login");
    } catch {
      toast.error("Unable to reset password. Check OTP and try again.");
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="Use the OTP sent to your email and set a new password.">
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
        />

        <Input
          label="New Password"
          type="password"
          placeholder="At least 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Button fullWidth type="submit" disabled={!isValid || loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>

        <p className="text-center text-sm text-text/70">
          Back to{" "}
          <Link className="font-semibold text-accent" to="/login">
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

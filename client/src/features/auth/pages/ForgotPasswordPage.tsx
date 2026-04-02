import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { forgotPasswordThunk, selectAuth } from "../authSlice";
import AuthShell from "../components/AuthShell";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector(selectAuth);

  const [email, setEmail] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await dispatch(forgotPasswordThunk({ email: email.trim().toLowerCase() })).unwrap();
      toast.success("If your account exists, OTP has been sent");
      navigate(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch {
      toast.error("Unable to process request");
    }
  };

  return (
    <AuthShell title="Forgot password" subtitle="We will send a one-time code to reset your password.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button fullWidth type="submit" disabled={!email.includes("@") || loading}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </Button>

        <p className="text-center text-sm text-text/70">
          Remembered your password?{" "}
          <Link className="font-semibold text-accent" to="/login">
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

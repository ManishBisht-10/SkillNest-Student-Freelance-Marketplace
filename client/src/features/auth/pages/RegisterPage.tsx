import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { getErrorMessage } from "../../../shared/utils/errors";
import { registerThunk, selectAuth, setPendingOtpEmail } from "../authSlice";
import AuthShell from "../components/AuthShell";

type RoleChoice = "student" | "consumer";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector(selectAuth);

  const [role, setRole] = useState<RoleChoice>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValid = useMemo(() => {
    return name.trim().length >= 2 && email.includes("@") && password.length >= 8;
  }, [name, email, password]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await dispatch(
        registerThunk({
          role,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        })
      ).unwrap();

      dispatch(setPendingOtpEmail(email.trim().toLowerCase()));
      toast.success("OTP sent to your email");
      navigate("/verify-otp");
    } catch (error) {
      toast.error(getErrorMessage(error, "Registration failed. Please review your details."));
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Choose your role and get started in minutes.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <p className="mb-2 text-sm font-medium text-text/90">I want to join as</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                role === "student"
                  ? "border-accent bg-accent text-white"
                  : "border-secondary bg-secondary/20 text-text"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("consumer")}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                role === "consumer"
                  ? "border-accent bg-accent text-white"
                  : "border-secondary bg-secondary/20 text-text"
              }`}
            >
              Consumer
            </button>
          </div>
        </div>

        <Input
          label="Full Name"
          placeholder="Aarav Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          hint="Use a strong password with letters and numbers"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button fullWidth type="submit" disabled={!isValid || loading}>
          {loading ? "Creating account..." : "Register & Send OTP"}
        </Button>

        <p className="text-center text-sm text-text/70">
          Already have an account?{" "}
          <Link className="font-semibold text-accent" to="/login">
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

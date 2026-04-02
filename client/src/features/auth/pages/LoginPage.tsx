import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { getErrorMessage } from "../../../shared/utils/errors";
import { loginThunk, selectAuth } from "../authSlice";
import AuthShell from "../components/AuthShell";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector(selectAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValid = useMemo(() => email.includes("@") && password.length > 0, [email, password]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await dispatch(
        loginThunk({
          email: email.trim().toLowerCase(),
          password,
        })
      ).unwrap();

      toast.success("Welcome back");
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid email or password"));
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Login to continue your SkillNest journey.">
      <form className="space-y-4" onSubmit={onSubmit}>
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
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-end">
          <Link className="text-sm font-medium text-accent" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <Button fullWidth type="submit" disabled={!isValid || loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>

        <p className="text-center text-sm text-text/70">
          New to SkillNest?{" "}
          <Link className="font-semibold text-accent" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

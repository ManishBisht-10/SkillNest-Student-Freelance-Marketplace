import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export default function Input({ label, hint, error, className, ...props }: InputProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-text/90">{label}</span>
      <input
        className={clsx(
          "h-11 rounded-xl border bg-white/5 px-3 text-sm text-white placeholder:text-text/40 outline-none transition",
          error
            ? "border-red-400 focus:border-red-300"
            : "border-secondary/80 focus:border-accent",
          className
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-red-300">{error}</span>
      ) : hint ? (
        <span className="text-xs text-text/60">{hint}</span>
      ) : null}
    </label>
  );
}

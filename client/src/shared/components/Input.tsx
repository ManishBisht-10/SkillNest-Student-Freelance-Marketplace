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
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className={clsx(
          "h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition",
          error
            ? "border-red-300 focus:border-red-400"
            : "focus:border-accent",
          className
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

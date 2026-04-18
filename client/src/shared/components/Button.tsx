import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export default function Button({
  children,
  className,
  variant = "primary",
  fullWidth = false,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        {
          "bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent/90":
            variant === "primary",
          "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50":
            variant === "secondary",
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900": variant === "ghost",
          "w-full": fullWidth,
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

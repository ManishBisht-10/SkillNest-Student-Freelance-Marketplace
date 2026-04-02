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
          "bg-accent text-white shadow-lg shadow-accent/30 hover:bg-accent/90":
            variant === "primary",
          "border border-secondary bg-secondary/30 text-text hover:bg-secondary/50":
            variant === "secondary",
          "text-text/80 hover:bg-white/10 hover:text-white": variant === "ghost",
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

import { Link } from "react-router-dom";

type SkillNestLogoProps = {
  to?: string;
  compact?: boolean;
  className?: string;
};

export default function SkillNestLogo({
  to = "/",
  compact = false,
  className = "",
}: SkillNestLogoProps) {
  const label = compact ? "SN" : "SkillNest";

  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      aria-label="SkillNest home"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-accent/60 bg-accent/15 text-accent transition group-hover:scale-105 group-hover:bg-accent/20">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4.5 8.25L12 4.5L19.5 8.25L12 12L4.5 8.25Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 10.5V14.25C7.5 15.525 9.54 16.5 12 16.5C14.46 16.5 16.5 15.525 16.5 14.25V10.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M19.5 9.75V13.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="font-heading text-xl font-bold tracking-tight text-white">{label}</span>
    </Link>
  );
}
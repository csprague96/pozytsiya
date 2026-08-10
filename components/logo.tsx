export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <line
        x1="4"
        y1="16"
        x2="28"
        y2="16"
        stroke="var(--primary)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="21.5" cy="16" r="6" fill="var(--gold)" />
    </svg>
  );
}

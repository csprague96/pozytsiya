import { cn } from "@/lib/utils";

/* Muted tints keyed off the slug so each artist gets a stable, quiet color. */
const TINTS = [
  "bg-[oklch(0.93_0.03_255)] text-[oklch(0.42_0.09_255)] dark:bg-[oklch(0.3_0.03_255)] dark:text-[oklch(0.84_0.05_255)]",
  "bg-[oklch(0.94_0.04_95)] text-[oklch(0.45_0.08_85)] dark:bg-[oklch(0.31_0.04_90)] dark:text-[oklch(0.85_0.07_92)]",
  "bg-[oklch(0.93_0.03_160)] text-[oklch(0.4_0.07_160)] dark:bg-[oklch(0.3_0.03_160)] dark:text-[oklch(0.84_0.05_160)]",
  "bg-[oklch(0.94_0.03_30)] text-[oklch(0.44_0.08_30)] dark:bg-[oklch(0.3_0.03_30)] dark:text-[oklch(0.85_0.05_30)]",
  "bg-[oklch(0.93_0.03_310)] text-[oklch(0.42_0.08_310)] dark:bg-[oklch(0.3_0.03_310)] dark:text-[oklch(0.84_0.05_310)]",
  "bg-[oklch(0.93_0.03_210)] text-[oklch(0.4_0.07_210)] dark:bg-[oklch(0.3_0.03_210)] dark:text-[oklch(0.84_0.05_210)]",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function initialsOf(name: string): string {
  const words = name
    .replace(/[«»"'()\[\]]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const letters = words.slice(0, 2).map((w) => [...w][0]);
  return letters.join("").toUpperCase();
}

export function Monogram({
  name,
  slug,
  className,
}: {
  name: string;
  slug: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full font-semibold",
        TINTS[hash(slug) % TINTS.length],
        className ?? "size-9 text-sm",
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

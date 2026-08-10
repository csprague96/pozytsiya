import { cn } from "@/lib/utils";

type Props = {
  stance: number | null;
  status: "positioned" | "silent" | "ambiguous";
  size?: "sm" | "lg";
  className?: string;
};

/**
 * The logo motif at work: a dot plotted on a seven-stop track.
 * Left = pro-Russia, right = pro-Ukraine. Silent renders hollow, ambiguous
 * renders neutral-filled, both centered.
 */
export function StanceMeter({ stance, status, size = "sm", className }: Props) {
  const stops = [-3, -2, -1, 0, 1, 2, 3];
  const value = stance ?? 0;
  const left = `${((value + 3) / 6) * 100}%`;
  const sm = size === "sm";

  return (
    <div
      aria-hidden="true"
      className={cn("relative", sm ? "h-2.5 w-24" : "h-4 w-64 max-w-full", className)}
    >
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      {stops.map((s) => (
        <span
          key={s}
          className={cn(
            "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/20",
            sm ? "size-[3px]" : "size-1",
          )}
          style={{ left: `${((s + 3) / 6) * 100}%` }}
        />
      ))}
      <span
        className={cn(
          "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
          sm ? "size-2.5" : "size-4",
          stance !== null && stance > 0 && "bg-stance-ua",
          stance !== null && stance < 0 && "bg-stance-ru",
          stance === null && status === "ambiguous" && "bg-stance-neutral",
          stance === null &&
            status !== "ambiguous" &&
            "border-2 border-stance-neutral bg-background",
        )}
        style={{ left }}
      />
    </div>
  );
}

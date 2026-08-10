import type { Artist } from "./schema";

export type StanceKey =
  | "ua_active"
  | "ua_vocal"
  | "ua_leaning"
  | "ambiguous"
  | "silent"
  | "ru_leaning"
  | "ru_vocal"
  | "ru_active";

/** Spectrum order used for filters, sorting, and the methodology page. */
export const STANCE_ORDER: StanceKey[] = [
  "ua_active",
  "ua_vocal",
  "ua_leaning",
  "ambiguous",
  "silent",
  "ru_leaning",
  "ru_vocal",
  "ru_active",
];

const BY_VALUE: Record<number, StanceKey> = {
  3: "ua_active",
  2: "ua_vocal",
  1: "ua_leaning",
  [-1]: "ru_leaning",
  [-2]: "ru_vocal",
  [-3]: "ru_active",
};

export function stanceKey(
  stance: Artist["stance"],
  status: Artist["status"],
): StanceKey {
  if (stance === null) return status === "ambiguous" ? "ambiguous" : "silent";
  return BY_VALUE[stance];
}

export function stanceKeyOf(artist: Pick<Artist, "stance" | "status">) {
  return stanceKey(artist.stance, artist.status);
}

/** Sort rank: pro-Ukraine first, then unaligned, then pro-Russia. */
export function stanceRank(artist: Pick<Artist, "stance" | "status">): number {
  return STANCE_ORDER.indexOf(stanceKeyOf(artist));
}

export function hasStanceChanged(artist: Pick<Artist, "timeline">): boolean {
  const shifts = artist.timeline.filter((e) => e.stanceAfter !== undefined);
  return shifts.length > 1;
}

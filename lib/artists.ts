import fs from "node:fs";
import path from "node:path";
import { ArtistSchema, type Artist } from "./schema";

const DATA_DIR = path.join(process.cwd(), "data", "artists");

let cache: Artist[] | null = null;

/** Loads and validates every artist file. Invalid data fails the build. */
export function getArtists(): Artist[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const errors: string[] = [];
  const artists: Artist[] = [];
  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
    const parsed = ArtistSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push(`${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
    } else {
      if (parsed.data.slug !== path.basename(file, ".json")) {
        errors.push(`${file}: slug "${parsed.data.slug}" does not match filename`);
      }
      artists.push(parsed.data);
    }
  }
  if (errors.length) {
    throw new Error(`Artist data validation failed:\n${errors.join("\n")}`);
  }
  artists.sort((a, b) => a.name.localeCompare(b.name, "en"));
  cache = artists;
  return artists;
}

export function getArtist(slug: string): Artist | undefined {
  return getArtists().find((a) => a.slug === slug);
}

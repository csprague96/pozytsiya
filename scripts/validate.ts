import fs from "node:fs";
import path from "node:path";
import { ArtistSchema } from "../lib/schema";

const DATA_DIR = path.join(process.cwd(), "data", "artists");

const files = fs
  .readdirSync(DATA_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();

const errors: string[] = [];
for (const file of files) {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
  } catch (e) {
    errors.push(`${file}: invalid JSON (${(e as Error).message})`);
    continue;
  }
  const parsed = ArtistSchema.safeParse(raw);
  if (!parsed.success) {
    errors.push(
      `${file}: ${parsed.error.issues
        .map((i) => `${i.path.join(".")} ${i.message}`)
        .join("; ")}`,
    );
    continue;
  }
  if (parsed.data.slug !== path.basename(file, ".json")) {
    errors.push(`${file}: slug "${parsed.data.slug}" does not match filename`);
  }
}

if (errors.length) {
  console.error(`Artist data validation failed:\n${errors.join("\n")}`);
  process.exit(1);
}
console.log(`OK: ${files.length} artist files valid.`);

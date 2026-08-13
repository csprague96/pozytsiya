/**
 * Fetches free-licensed artist photos from Wikipedia/Wikimedia Commons.
 *
 * Usage:
 *   node scripts/fetch-images.mjs scan    # find images + licenses, write scripts/image-report.json
 *   node scripts/fetch-images.mjs apply   # download approved images, update data/artists/*.json
 *
 * Only images whose Commons license is free (CC BY / BY-SA / CC0 / public
 * domain) are ever used. `scripts/image-overrides.json` can pin a slug to a
 * specific wiki page ({"slug": {"wiki": "ru", "title": "..."}}) or exclude it
 * ({"slug": "skip"}).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const DATA_DIR = path.join(ROOT, "data", "artists");
const OUT_DIR = path.join(ROOT, "public", "artists");
const REPORT = path.join(ROOT, "scripts", "image-report.json");
const OVERRIDES_FILE = path.join(ROOT, "scripts", "image-overrides.json");

const UA =
  "PozytsiyaImageFetcher/1.0 (https://pozytsiya.vercel.app; sakinnikasthtrp@gmail.com)";

const FREE_LICENSE =
  /\b(cc[ -]?by(?:[ -]?sa)?|cc0|public domain|pd|attribution|fal|free art|gfdl)\b/i;
const NON_FREE = /non[ -]?free|fair use/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(host, params) {
  const url = `https://${host}/w/api.php?${new URLSearchParams({
    format: "json",
    origin: "*",
    ...params,
  })}`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return res.json();
    if (res.status !== 429 || attempt >= 4)
      throw new Error(`${res.status} ${url}`);
    const wait = Number(res.headers.get("retry-after")) * 1000 || 30000 * (attempt + 1);
    console.log(`  429, waiting ${wait / 1000}s`);
    await sleep(wait);
  }
}

/** Returns { wiki, title, file } for the best-matching page with a lead image. */
async function findPage(artist, override) {
  const tries = override
    ? [override]
    : [
        { wiki: "en", title: artist.name },
        ...(artist.nameLocal
          ? [
              { wiki: "uk", title: artist.nameLocal },
              { wiki: "ru", title: artist.nameLocal },
            ]
          : []),
        { wiki: "en", search: `${artist.name} singer OR band OR rapper` },
      ];

  for (const t of tries) {
    const host = `${t.wiki}.wikipedia.org`;
    let title = t.title;
    if (!title && t.search) {
      const s = await api(host, {
        action: "query",
        list: "search",
        srsearch: t.search,
        srlimit: "1",
      });
      title = s.query?.search?.[0]?.title;
      if (!title) continue;
    }
    const q = await api(host, {
      action: "query",
      titles: title,
      prop: "pageimages",
      piprop: "name",
      redirects: "1",
    });
    const page = Object.values(q.query?.pages ?? {})[0];
    if (!page || page.missing !== undefined) continue;
    if (page.pageimage)
      return { wiki: t.wiki, title: page.title, file: page.pageimage };
  }
  return null;
}

/** Commons metadata for a file: image URL, license, author, source page. */
async function commonsInfo(file) {
  const q = await api("commons.wikimedia.org", {
    action: "query",
    titles: `File:${file}`,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1024",
  });
  const page = Object.values(q.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null; // not on Commons → local (likely non-free) file
  const meta = info.extmetadata ?? {};
  const strip = (v) => v?.value?.replace(/<[^>]*>/g, "").trim() || undefined;
  return {
    imageUrl: info.thumburl ?? info.url,
    sourceUrl: info.descriptionurl,
    license: strip(meta.LicenseShortName),
    licenseUrl: meta.LicenseUrl?.value,
    credit: strip(meta.Artist),
  };
}

function licenseOk(license) {
  return !!license && FREE_LICENSE.test(license) && !NON_FREE.test(license);
}

const slugs = fs
  .readdirSync(DATA_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => path.basename(f, ".json"));
const overrides = fs.existsSync(OVERRIDES_FILE)
  ? JSON.parse(fs.readFileSync(OVERRIDES_FILE, "utf8"))
  : {};
const mode = process.argv[2];

if (mode === "scan") {
  const report = {};
  for (const slug of slugs) {
    const artist = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, `${slug}.json`), "utf8"),
    );
    if (overrides[slug] === "skip") {
      report[slug] = { status: "skipped" };
      continue;
    }
    try {
      const page = await findPage(artist, overrides[slug]);
      if (!page) {
        report[slug] = { status: "no_page" };
      } else {
        const info = await commonsInfo(page.file);
        if (!info) {
          report[slug] = { status: "not_on_commons", ...page };
        } else if (!licenseOk(info.license)) {
          report[slug] = { status: "bad_license", ...page, ...info };
        } else {
          report[slug] = { status: "ok", ...page, ...info };
        }
      }
    } catch (e) {
      report[slug] = { status: "error", error: String(e) };
    }
    console.log(`${slug}: ${report[slug].status} ${report[slug].title ?? ""}`);
    await sleep(250);
  }
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n");
  const counts = {};
  for (const r of Object.values(report))
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  console.log("\nSummary:", counts);
} else if (mode === "apply") {
  const report = JSON.parse(fs.readFileSync(REPORT, "utf8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let applied = 0;
  for (const slug of slugs) {
    const r = report[slug];
    if (r?.status !== "ok") continue;
    if (fs.existsSync(path.join(OUT_DIR, `${slug}.jpg`))) continue;

    let res;
    for (let attempt = 0; attempt < 5; attempt++) {
      res = await fetch(r.imageUrl, { headers: { "User-Agent": UA } });
      if (res.status !== 429) break;
      const wait = Number(res.headers.get("retry-after")) * 1000 || 30000 * (attempt + 1);
      console.log(`${slug}: 429, waiting ${wait / 1000}s`);
      await sleep(wait);
    }
    if (!res.ok) {
      console.error(`${slug}: download failed ${res.status}`);
      continue;
    }
    await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(512, 512, { fit: "cover", position: sharp.strategy.attention })
      .jpeg({ quality: 82 })
      .toFile(path.join(OUT_DIR, `${slug}.jpg`));

    const file = path.join(DATA_DIR, `${slug}.json`);
    const artist = JSON.parse(fs.readFileSync(file, "utf8"));
    artist.image = {
      credit: r.credit ?? "Wikimedia Commons",
      license: r.license,
      ...(r.licenseUrl ? { licenseUrl: r.licenseUrl } : {}),
      sourceUrl: r.sourceUrl,
    };
    fs.writeFileSync(file, JSON.stringify(artist, null, 2) + "\n");
    applied++;
    console.log(`${slug}: saved (${r.license})`);
    await sleep(3000);
  }
  console.log(`\nApplied ${applied} images.`);
} else {
  console.error("Usage: node scripts/fetch-images.mjs <scan|apply>");
  process.exit(1);
}

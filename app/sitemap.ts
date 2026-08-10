import type { MetadataRoute } from "next";
import { getArtists } from "@/lib/artists";
import { routing } from "@/i18n/routing";

const BASE = "https://pozytsiya.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    entries.push(
      { url: `${BASE}/${locale}`, changeFrequency: "weekly", priority: 1 },
      { url: `${BASE}/${locale}/about`, changeFrequency: "monthly", priority: 0.5 },
    );
    for (const a of getArtists()) {
      entries.push({
        url: `${BASE}/${locale}/artist/${a.slug}`,
        lastModified: a.lastReviewed,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }
  return entries;
}

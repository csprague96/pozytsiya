import { z } from "zod";

export const LocalizedSchema = z.object({
  en: z.string().min(1),
  uk: z.string().min(1),
  ru: z.string().min(1),
});

export const FLAGS = [
  "left_russia",
  "banned_in_ukraine",
  "rf_foreign_agent",
  "serving_or_supported_afu",
  "performed_in_occupied_territories",
  "sanctioned",
  "deceased",
] as const;

export const SourceSchema = z.object({
  url: z.string().url(),
  publisher: z.string().min(1),
  date: z.string().optional(),
});

/**
 * Photo credit for `public/artists/<slug>.jpg`. Only free-licensed images
 * (CC BY / CC BY-SA / CC0 / public domain) may be used; attribution is
 * mandatory whenever a photo exists.
 */
export const ImageSchema = z.object({
  credit: z.string().min(1),
  license: z.string().min(1),
  licenseUrl: z.string().url().optional(),
  sourceUrl: z.string().url(),
});

export const TimelineEventSchema = z.object({
  date: z.string().regex(/^\d{4}(-\d{2})?(-\d{2})?$/),
  stanceAfter: z.number().int().min(-3).max(3).nullable().optional(),
  title: LocalizedSchema,
  detail: LocalizedSchema,
  sources: z.array(SourceSchema).min(1),
});

export const ArtistSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  nameLocal: z.string().optional(),
  country: z.enum(["ua", "ru", "by", "kz", "az", "other"]),
  basedIn: z.string().length(2).optional(),
  conflict: z.literal("ukraine"),
  stance: z
    .union([
      z.literal(-3),
      z.literal(-2),
      z.literal(-1),
      z.literal(1),
      z.literal(2),
      z.literal(3),
    ])
    .nullable(),
  status: z.enum(["positioned", "silent", "ambiguous"]),
  flags: z.array(z.enum(FLAGS)),
  summary: LocalizedSchema,
  timeline: z.array(TimelineEventSchema),
  lastReviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  disputed: z.boolean().optional(),
  image: ImageSchema.optional(),
});

export type Artist = z.infer<typeof ArtistSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type ArtistFlag = (typeof FLAGS)[number];
export type Localized = z.infer<typeof LocalizedSchema>;
export type ArtistImage = z.infer<typeof ImageSchema>;

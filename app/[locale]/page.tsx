import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getArtists } from "@/lib/artists";
import { hasStanceChanged, stanceKeyOf } from "@/lib/stance";
import { searchForms } from "@/lib/translit";
import {
  ArtistDirectory,
  type DirectoryItem,
} from "@/components/artist-directory";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const items: DirectoryItem[] = getArtists().map((a) => ({
    slug: a.slug,
    name: a.name,
    nameLocal: a.nameLocal,
    country: a.country,
    stance: a.stance,
    status: a.status,
    stanceKey: stanceKeyOf(a),
    flags: a.flags,
    stanceChanged: hasStanceChanged(a),
    lastReviewed: a.lastReviewed,
    searchForms: searchForms(a.name, a.nameLocal),
    hasPhoto: a.image !== undefined,
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("home.title")}
      </h1>
      <p className="mt-1.5 max-w-[70ch] text-muted-foreground">
        {t("home.intro")}
      </p>
      <div className="mt-6">
        <Suspense>
          <ArtistDirectory items={items} />
        </Suspense>
      </div>
    </div>
  );
}

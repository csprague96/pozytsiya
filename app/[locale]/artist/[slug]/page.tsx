import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleAlert } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getArtist, getArtists } from "@/lib/artists";
import { formatEventDate, regionName } from "@/lib/dates";
import { hasStanceChanged, stanceKeyOf } from "@/lib/stance";
import { Monogram } from "@/components/monogram";
import { StanceMeter } from "@/components/stance-meter";
import { Timeline } from "@/components/timeline";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return getArtists().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const artist = getArtist(slug);
  if (!artist) return {};
  return {
    title: artist.name,
    description: artist.summary[locale as "en" | "uk" | "ru"],
  };
}

export default async function ArtistPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as "en" | "uk" | "ru";
  const artist = getArtist(slug);
  if (!artist) notFound();
  const t = await getTranslations();
  const key = stanceKeyOf(artist);
  const changed = hasStanceChanged(artist);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {t("artist.back")}
      </Link>

      <header className="mt-6 flex items-start gap-4">
        <Monogram
          name={artist.name}
          slug={artist.slug}
          className="size-16 text-xl"
          stance={artist.stance}
          status={artist.status}
          dotClassName="size-4.5"
        />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">
            {artist.name}
          </h1>
          <p className="mt-0.5 text-muted-foreground">
            {artist.nameLocal && artist.nameLocal !== artist.name && (
              <span>{artist.nameLocal} · </span>
            )}
            <span>
              {t("artist.from")}{" "}
              {artist.country === "other"
                ? t("country.other")
                : regionName(artist.country, locale)}
            </span>
            {artist.basedIn && artist.basedIn !== artist.country && (
              <span>
                {" "}
                · {t("artist.basedIn")} {regionName(artist.basedIn, locale)}
              </span>
            )}
          </p>
        </div>
      </header>

      <section className="mt-6 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div>
            <p className="font-medium">{t(`stance.${key}.label`)}</p>
            <p className="mt-0.5 max-w-[55ch] text-sm text-muted-foreground">
              {t(`stance.${key}.desc`)}
            </p>
          </div>
          <StanceMeter stance={artist.stance} status={artist.status} size="lg" />
        </div>
        {(artist.flags.length > 0 || changed || artist.disputed) && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
            {artist.disputed && (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <CircleAlert className="size-3" aria-hidden="true" />
                {t("artist.disputed")}
              </Badge>
            )}
            {changed && (
              <Badge variant="outline" className="text-muted-foreground">
                {t("flags.stance_changed")}
              </Badge>
            )}
            {artist.flags.map((f) => (
              <Badge key={f} variant="outline" className="text-muted-foreground">
                {t(`flags.${f}`)}
              </Badge>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 max-w-[70ch] leading-relaxed">
        {artist.summary[locale]}
      </p>

      {artist.timeline.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-5 text-lg font-semibold tracking-tight">
            {t("artist.timeline")}
          </h2>
          <Timeline artist={artist} />
        </section>
      )}

      <footer className="mt-10 border-t border-border pt-4 text-sm text-muted-foreground">
        <p>
          {t("artist.lastReviewed", {
            date: formatEventDate(artist.lastReviewed, locale),
          })}
        </p>
      </footer>
    </article>
  );
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { STANCE_ORDER } from "@/lib/stance";
import { FLAGS } from "@/lib/schema";
import { StanceMeter } from "@/components/stance-meter";

type Props = { params: Promise<{ locale: string }> };

const METER_PREVIEW: Record<string, { stance: number | null; status: "positioned" | "silent" | "ambiguous" }> = {
  ua_active: { stance: 3, status: "positioned" },
  ua_vocal: { stance: 2, status: "positioned" },
  ua_leaning: { stance: 1, status: "positioned" },
  ambiguous: { stance: null, status: "ambiguous" },
  silent: { stance: null, status: "silent" },
  ru_leaning: { stance: -1, status: "positioned" },
  ru_vocal: { stance: -2, status: "positioned" },
  ru_active: { stance: -3, status: "positioned" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("about.title")}
      </h1>
      <div className="mt-3 max-w-[70ch] space-y-3 leading-relaxed">
        <p>{t("about.intro1")}</p>
        <p className="text-muted-foreground">{t("about.intro2")}</p>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("about.scaleTitle")}
        </h2>
        <p className="mt-1.5 max-w-[70ch] text-muted-foreground">
          {t("about.scaleIntro")}
        </p>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {STANCE_ORDER.map((key) => (
            <li
              key={key}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium">{t(`stance.${key}.label`)}</p>
                <p className="mt-0.5 max-w-[55ch] text-sm text-muted-foreground">
                  {t(`stance.${key}.desc`)}
                </p>
              </div>
              <StanceMeter
                stance={METER_PREVIEW[key].stance}
                status={METER_PREVIEW[key].status}
                size="sm"
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("about.flagsTitle")}
        </h2>
        <p className="mt-1.5 max-w-[70ch] text-muted-foreground">
          {t("about.flagsIntro")}
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {[...FLAGS, "stance_changed"].map((f) => (
            <li
              key={f}
              className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
            >
              {t(`flags.${f}`)}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("about.sourcingTitle")}
        </h2>
        <p className="mt-1.5 max-w-[70ch] leading-relaxed text-muted-foreground">
          {t("about.sourcingBody")}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("about.correctionsTitle")}
        </h2>
        <p className="mt-1.5 max-w-[70ch] leading-relaxed text-muted-foreground">
          {t("about.correctionsBody")}
        </p>
        <a
          href="https://github.com/csprague96/pozytsiya"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-primary hover:underline"
        >
          GitHub
        </a>
      </section>
    </div>
  );
}

import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatEventDate } from "@/lib/dates";
import { stanceKey } from "@/lib/stance";
import type { Artist, TimelineEvent } from "@/lib/schema";
import { cn } from "@/lib/utils";

function markerClass(e: TimelineEvent): string {
  if (e.stanceAfter === undefined) return "bg-border";
  if (e.stanceAfter === null) return "bg-stance-neutral";
  return e.stanceAfter > 0 ? "bg-stance-ua" : "bg-stance-ru";
}

export function Timeline({ artist }: { artist: Artist }) {
  const t = useTranslations();
  const locale = useLocale() as "en" | "uk" | "ru";
  const events = [...artist.timeline].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <ol className="relative space-y-7 border-l border-border pl-6">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span
            aria-hidden="true"
            className={cn(
              "absolute -left-6 top-1.5 size-2.5 -translate-x-1/2 rounded-full",
              markerClass(e),
            )}
          />
          <p className="text-sm tabular-nums text-muted-foreground">
            {formatEventDate(e.date, locale)}
          </p>
          <h3 className="mt-0.5 font-medium leading-snug">{e.title[locale]}</h3>
          <p className="mt-1 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
            {e.detail[locale]}
          </p>
          {e.stanceAfter !== undefined && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t("artist.stanceShift")}:{" "}
              <span className="font-medium text-foreground">
                {t(
                  `stance.${stanceKey(
                    e.stanceAfter as Artist["stance"],
                    e.stanceAfter === null ? "ambiguous" : "positioned",
                  )}.label`,
                )}
              </span>
            </p>
          )}
          <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {e.sources.map((s, j) => (
              <a
                key={j}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                {s.publisher}
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            ))}
          </p>
        </li>
      ))}
    </ol>
  );
}

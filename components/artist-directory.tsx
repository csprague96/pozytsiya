"use client";

import { ArrowRightLeft, ListFilter, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { regionName } from "@/lib/dates";
import { matchesQuery } from "@/lib/translit";
import { STANCE_ORDER, type StanceKey } from "@/lib/stance";
import { Monogram } from "@/components/monogram";
import { StanceMeter } from "@/components/stance-meter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type DirectoryItem = {
  slug: string;
  name: string;
  nameLocal?: string;
  country: string;
  stance: number | null;
  status: "positioned" | "silent" | "ambiguous";
  stanceKey: StanceKey;
  flags: string[];
  stanceChanged: boolean;
  lastReviewed: string;
  searchForms: string[];
};

const COUNTRIES = ["ua", "ru", "by", "kz", "az", "other"];
const FLAG_KEYS = [
  "left_russia",
  "banned_in_ukraine",
  "rf_foreign_agent",
  "serving_or_supported_afu",
  "performed_in_occupied_territories",
  "sanctioned",
  "deceased",
  "stance_changed",
];

type Sort = "name" | "stance" | "updated";

export function ArtistDirectory({ items }: { items: DirectoryItem[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [stances, setStances] = useState<Set<StanceKey>>(
    () =>
      new Set(
        (searchParams.get("stance")?.split(",") ?? []).filter((s): s is StanceKey =>
          (STANCE_ORDER as string[]).includes(s),
        ),
      ),
  );
  const [country, setCountry] = useState(searchParams.get("country") ?? "all");
  const [flags, setFlags] = useState<Set<string>>(
    () =>
      new Set(
        (searchParams.get("flags")?.split(",") ?? []).filter((f) =>
          FLAG_KEYS.includes(f),
        ),
      ),
  );
  const [sort, setSort] = useState<Sort>(
    (["name", "stance", "updated"].includes(searchParams.get("sort") ?? "")
      ? searchParams.get("sort")
      : "stance") as Sort,
  );

  function syncUrl(next: {
    q?: string;
    stances?: Set<StanceKey>;
    country?: string;
    flags?: Set<string>;
    sort?: Sort;
  }) {
    const p = new URLSearchParams();
    const q = next.q ?? query;
    const st = next.stances ?? stances;
    const c = next.country ?? country;
    const fl = next.flags ?? flags;
    const so = next.sort ?? sort;
    if (q) p.set("q", q);
    if (st.size) p.set("stance", [...st].join(","));
    if (c !== "all") p.set("country", c);
    if (fl.size) p.set("flags", [...fl].join(","));
    if (so !== "stance") p.set("sort", so);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
  }

  const counts = useMemo(() => {
    const c = new Map<StanceKey, number>();
    for (const it of items) c.set(it.stanceKey, (c.get(it.stanceKey) ?? 0) + 1);
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    let list = items.filter((it) => {
      if (stances.size && !stances.has(it.stanceKey)) return false;
      if (country !== "all" && it.country !== country) return false;
      for (const f of flags) {
        if (f === "stance_changed" ? !it.stanceChanged : !it.flags.includes(f))
          return false;
      }
      return matchesQuery(it.searchForms, query);
    });
    list = [...list];
    if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name, locale));
    } else if (sort === "stance") {
      list.sort(
        (a, b) =>
          STANCE_ORDER.indexOf(a.stanceKey) - STANCE_ORDER.indexOf(b.stanceKey) ||
          a.name.localeCompare(b.name, locale),
      );
    } else {
      list.sort(
        (a, b) =>
          b.lastReviewed.localeCompare(a.lastReviewed) ||
          a.name.localeCompare(b.name, locale),
      );
    }
    return list;
  }, [items, query, stances, country, flags, sort, locale]);

  const stats = useMemo(() => {
    const ua = items.filter((i) => i.stance !== null && i.stance > 0).length;
    const ru = items.filter((i) => i.stance !== null && i.stance < 0).length;
    return { total: items.length, ua, ru, none: items.length - ua - ru };
  }, [items]);

  const hasFilters =
    query !== "" || stances.size > 0 || country !== "all" || flags.size > 0;

  return (
    <div>
      <p className="text-sm text-muted-foreground tabular-nums">
        {t("home.stats", stats)}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              syncUrl({ q: e.target.value });
            }}
            placeholder={t("home.searchPlaceholder")}
            className="pl-9"
            aria-label={t("home.searchPlaceholder")}
          />
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("home.stanceLabel")}>
          {STANCE_ORDER.map((key) => {
            const active = stances.has(key);
            const count = counts.get(key) ?? 0;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  const next = new Set(stances);
                  if (active) next.delete(key);
                  else next.add(key);
                  setStances(next);
                  syncUrl({ stances: next });
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {t(`stance.${key}.label`)}
                <span className={cn("tabular-nums", active ? "opacity-80" : "opacity-60")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={country}
            onValueChange={(v) => {
              setCountry(v);
              syncUrl({ country: v });
            }}
          >
            <SelectTrigger size="sm" className="w-auto gap-1.5" aria-label={t("home.countryLabel")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("home.allCountries")}</SelectItem>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "other" ? t("country.other") : regionName(c, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ListFilter className="size-3.5" />
                {t("about.flagsTitle")}
                {flags.size > 0 && (
                  <span className="tabular-nums text-muted-foreground">{flags.size}</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {FLAG_KEYS.map((f) => (
                <DropdownMenuCheckboxItem
                  key={f}
                  checked={flags.has(f)}
                  onCheckedChange={(checked) => {
                    const next = new Set(flags);
                    if (checked) next.add(f);
                    else next.delete(f);
                    setFlags(next);
                    syncUrl({ flags: next });
                  }}
                >
                  {t(`flags.${f}`)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={sort}
            onValueChange={(v) => {
              setSort(v as Sort);
              syncUrl({ sort: v as Sort });
            }}
          >
            <SelectTrigger size="sm" className="w-auto gap-1.5" aria-label={t("home.sortLabel")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stance">{t("home.sort.stance")}</SelectItem>
              <SelectItem value="name">{t("home.sort.name")}</SelectItem>
              <SelectItem value="updated">{t("home.sort.updated")}</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={() => {
                setQuery("");
                setStances(new Set());
                setCountry("all");
                setFlags(new Set());
                syncUrl({ q: "", stances: new Set(), country: "all", flags: new Set() });
              }}
            >
              <X className="size-3.5" />
              {t("home.clearFilters")}
            </Button>
          )}
        </div>
      </div>

      <ul className="mt-5 divide-y divide-border border-t border-border">
        {filtered.map((it) => (
          <li key={it.slug}>
            <Link
              href={`/artist/${it.slug}`}
              className="group flex items-center gap-3 py-3 focus-visible:outline-2 focus-visible:outline-ring sm:gap-4"
            >
              <Monogram
                name={it.name}
                slug={it.slug}
                stance={it.stance}
                status={it.status}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 font-medium leading-tight group-hover:text-primary">
                  <span className="truncate">{it.name}</span>
                  {it.stanceChanged && (
                    <ArrowRightLeft
                      className="size-3 shrink-0 text-muted-foreground"
                      aria-label={t("flags.stance_changed")}
                    />
                  )}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  {it.nameLocal && it.nameLocal !== it.name ? `${it.nameLocal} · ` : ""}
                  {it.country === "other"
                    ? t("country.other")
                    : regionName(it.country, locale)}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {t(`stance.${it.stanceKey}.label`)}
                </span>
                <StanceMeter stance={it.stance} status={it.status} size="sm" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <div className="border-t border-border py-16 text-center text-sm text-muted-foreground">
          <p>{t("home.empty")}</p>
          <Button
            variant="link"
            className="mt-1"
            onClick={() => {
              setQuery("");
              setStances(new Set());
              setCountry("all");
              setFlags(new Set());
              syncUrl({ q: "", stances: new Set(), country: "all", flags: new Set() });
            }}
          >
            {t("home.clearFilters")}
          </Button>
        </div>
      )}
    </div>
  );
}

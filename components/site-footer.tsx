import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[60ch]">{t("disclaimer")}</p>
        <div className="flex shrink-0 items-center gap-4">
          <Link href="/about" className="hover:text-foreground">
            {t("methodology")}
          </Link>
        </div>
      </div>
    </footer>
  );
}

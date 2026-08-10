/** Formats "2022", "2022-03", or "2022-03-18" in the given locale. */
export function formatEventDate(date: string, locale: string): string {
  const [y, m, d] = date.split("-");
  if (!m) return y;
  const dt = new Date(Date.UTC(+y, +m - 1, d ? +d : 1));
  return new Intl.DateTimeFormat(
    locale,
    d
      ? { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }
      : { year: "numeric", month: "long", timeZone: "UTC" },
  ).format(dt);
}

export function regionName(code: string, locale: string): string {
  try {
    return (
      new Intl.DisplayNames([locale], { type: "region" }).of(
        code.toUpperCase(),
      ) ?? code.toUpperCase()
    );
  } catch {
    return code.toUpperCase();
  }
}

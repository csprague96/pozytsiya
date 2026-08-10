/** Cyrillic-to-Latin transliteration for search matching ("okean" finds «Океан Ельзи»). */

const UK: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye", ж: "zh",
  з: "z", и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "yu", я: "ya",
  ё: "e", ъ: "", ы: "y", э: "e",
};

const RU: Record<string, string> = { ...UK, г: "g", и: "i", е: "e" };

function translitWith(map: Record<string, string>, s: string): string {
  return [...s].map((ch) => map[ch] ?? ch).join("");
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’ʼ`-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** All lowercase-normalized representations of a name worth matching against. */
export function searchForms(...names: (string | undefined)[]): string[] {
  const forms = new Set<string>();
  for (const raw of names) {
    if (!raw) continue;
    const n = normalize(raw);
    forms.add(n);
    forms.add(translitWith(UK, n));
    forms.add(translitWith(RU, n));
  }
  return [...forms];
}

export function matchesQuery(forms: string[], query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const variants = [q, translitWith(UK, q), translitWith(RU, q)];
  return forms.some((f) => variants.some((v) => f.includes(v)));
}

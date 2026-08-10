# Pozytsiya (Позиція)

A trilingual (EN / UK / RU) tracker of where popular musicians stand on Russia's
full-scale invasion of Ukraine. Built with Next.js 15, Tailwind CSS v4,
shadcn/ui, and next-intl; statically generated and deployed on Vercel.

## Data

Each artist lives in one file: `data/artists/<slug>.json`, validated against the
Zod schema in `lib/schema.ts` at build time — invalid data fails the build.

- `stance`: −3 … +3 (negative = pro-Russia, positive = pro-Ukraine), or `null`
  with `status` of `silent` / `ambiguous`.
- `timeline`: dated events, each with at least one source link. Events that mark
  a change of position carry `stanceAfter`.
- All prose fields (`summary`, event `title` / `detail`) are localized objects
  with `en`, `uk`, and `ru` keys.

To add or correct an artist, edit its JSON file and open a PR. The methodology
is described on the site's About page.

## Development

```bash
npm install
npm run dev
```

`npm run build` regenerates the fully static site (all three locales and every
artist page).

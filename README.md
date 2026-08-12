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

To add or correct an artist, edit its JSON file and open a PR. The editorial
methodology is described on the site's About page; the full research checklist
that contributors and automated research agents follow is in
[`docs/RESEARCH.md`](docs/RESEARCH.md).

`npm run validate` checks every artist file against the schema without a full
build.

## Automation

- `.github/workflows/ci.yml` validates data, lints, and builds on every PR.
- `.github/workflows/refresh-artists.yml` runs weekly (and on manual
  dispatch): it picks the entries with the oldest `lastReviewed`, re-researches
  them with Claude per `docs/RESEARCH.md`, and opens a **draft PR** for human
  review. It requires an `ANTHROPIC_API_KEY` repository secret and never
  merges on its own.

## Development

```bash
npm install
npm run dev
```

`npm run build` regenerates the fully static site (all three locales and every
artist page).

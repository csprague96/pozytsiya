# Research methodology for artist entries

This is the canonical checklist for anyone — human or research agent — adding or
updating an entry in `data/artists/`. The scheduled refresh job and ad-hoc
research agents must follow it exactly. It encodes the same editorial rules
published on the site's About page (`messages/*.json`, `about.*` keys).

## Core principles

1. **Documented statements and actions only.** Every claim must trace to a
   public statement or documented action. Nothing is inferred from silence:
   a person with no known position is `status: "silent"` with `stance: null` —
   never assigned a side.
2. **Every timeline event cites at least one dated source.** Prefer the
   person's own statements (interviews, official posts) and reporting from
   established outlets. Russian state media may be cited for facts about
   Russian government actions but must be labeled in the publisher string,
   e.g. `"EADaily (pro-Kremlin outlet)"`.
3. **Facts, not editorializing.** Titles and details state what happened,
   when, and quote where useful. No adjectives of judgment.
4. **Conflicting accounts → `disputed: true`.** If reliable sources genuinely
   disagree about what the person said or did, keep the entry, present the
   documented facts, and mark the whole entry disputed.

## Per-person checklist

### 1. Identify

- Confirm the exact person/act (disambiguate common names).
- Slug: lowercase latin, digits, hyphens (`^[a-z0-9-]+$`), must equal the
  filename (`data/artists/<slug>.json`).
- `name`: primary Latin/stage name. `nameLocal`: native-script name if it
  differs (Cyrillic for UA/RU artists; omit for most US/UK artists).
- `country`: citizenship/origin — one of `ua ru by kz az us gb other`.
  `basedIn`: 2-letter ISO region, only when they are durably based somewhere
  other than `country` (e.g. left Russia).
- `category`: `musician` (default), `actor`, `athlete`, or
  `other_public_figure`.

### 2. Research the record

Search for, at minimum:

- Statements at or after 24 February 2022 (the full-scale invasion) about the
  war, Russia, or Ukraine — social-media posts, interviews, onstage remarks.
- Actions: benefit concerts and fundraising; cancelled or continued shows in
  Russia; performances in Ukraine or for refugees; collaborations
  (e.g. recordings with Ukrainian artists); performances at pro-war events or
  in occupied territories.
- Official reactions: Ukrainian entry bans / SBU lists, Russian "foreign
  agent" designations, sanctions (check OpenSanctions), Russian wanted lists.
- Pre-2022 context only when it directly informs the position (e.g. 2014
  Crimea-era statements, long-standing ties to either country).
- For anything surprising or single-sourced, find a second independent source
  before including it.

### 3. Map evidence to a stance (−3 … +3, no 0)

| stance | key | bar to clear |
|---|---|---|
| **3** | Active supporter of Ukraine | Concrete support: fundraising, benefit concerts, volunteering, military service, sustained material aid. |
| **2** | Pro-Ukraine | Publicly condemned the invasion and named Russia as the aggressor. |
| **1** | Leans pro-Ukraine | Supportive gestures/signals (flag imagery, playing Ukrainian music, "stand with Ukraine" posts) without direct statements naming the aggressor. |
| **null** + `status: "ambiguous"` | Ambiguous | Evasive or contradictory: "against all war" without naming the aggressor; mixed signals. |
| **null** + `status: "silent"` | Silent | No known public position at all. |
| **−1** | Leans pro-Russia | Continues a Russian state-adjacent career while staying silent on the war; legitimizing gestures short of endorsement (e.g. touring Russia as if nothing happened, amplifying Kremlin framing). |
| **−2** | Pro-Russia | Publicly supports the invasion or blames Ukraine/NATO for it as their stated position. |
| **−3** | Active war promoter | Pro-war rallies and Z-concerts, performances in occupied territories, or fundraising for the Russian military. |

- `status` is `positioned` whenever `stance` is non-null.
- Western/international artists: the same bars apply. A benefit performance
  for Ukraine relief = 3; a clear "Russia invaded, I condemn it" = 2; a flag
  on stage with no statement = 1. Repeating Kremlin talking points (e.g.
  "NATO provoked it") as one's stated position is −2, not −1;
  simply refusing to pick a side is `ambiguous`.
- When the record shifted over time, `stance` is the **current** position;
  the history lives in the timeline via `stanceAfter`.

### 4. Build the timeline

- 2–6 events, chronological, each the moment something documented happened.
- `date`: `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` — as precise as the sources
  support, never more precise than the source.
- **Verify every event fits the real chronology**: an event's date must match
  its sources' dates; a `stanceAfter` sequence must tell a coherent story
  (first `stanceAfter` = initial public position; add another only when the
  position actually changed — two or more `stanceAfter` events make the UI
  show a "Stance changed" badge).
- `sources`: ≥1 per event, each `{url, publisher, date?}`. URLs must be
  real, checked, and point to the claimed content. No search-result or
  homepage links.

### 5. Write the prose (EN + UK + RU, all required)

- `summary`: 2–4 sentences: who they are, what they did/said about the war,
  and official consequences (bans, designations, sanctions) if any.
- Each event: short factual `title`, 1–3 sentence `detail`, in all three
  languages. Translations must be faithful, natural, and use the right
  toponyms (укр: «в Україні»; ru: «в Украине»).
- Quote sparingly and only what a cited source contains.

### 6. Flags

Set every flag that applies (see `lib/schema.ts` FLAGS):
`left_russia`, `banned_in_ukraine`, `rf_foreign_agent`,
`serving_or_supported_afu`, `performed_in_occupied_territories`,
`sanctioned`, `deceased`. Most international artists will have none —
an empty array is normal.

### 7. Finalize

- `conflict`: always `"ukraine"` (only supported value today).
- `lastReviewed`: today's date (`YYYY-MM-DD`) — set it even when a re-review
  found nothing new, so refresh rotation advances.
- Validate: `npm run validate` (schema + slug/filename check for every file).
  A full `npm run build` is the final gate.

## Updating an existing entry (refresh job)

1. Read the current JSON; note `lastReviewed` and the last timeline event.
2. Search for developments **since `lastReviewed`** (new statements, concerts,
   bans, sanctions, deaths).
3. If something happened: append timeline event(s) with sources, update
   `summary` in all three languages if the picture changed, adjust `stance`/
   `status`/`flags` only when the new evidence clears the rubric bar, and add
   `stanceAfter` only on a genuine position change.
4. If nothing happened: change nothing except `lastReviewed`.
5. Never rewrite existing events except to fix a documented factual error —
   and say so in the PR description.

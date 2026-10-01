# aparadecka_v2

Artist portfolio site built with Astro and Sanity CMS, with a GitHub Actions CI pipeline.

## Structure

- `studio/` — Sanity Studio (content model + admin UI)
- `web/` — Astro site (frontend)
- `shared/` — design tokens and shared CSS pulled in by both packages (`tokens.css`, `rich-text.css`)
- root `package.json` — tooling only (Husky hooks, lint-staged, dependency scripts); it is not an app package, and `studio/` and `web/` keep their own lockfiles

The **About page** is fully editable from the Studio: each section is a CMS block with rich text, an optional image, per-block text alignment, and image placement (left/right on desktop, above/under on mobile). See `studio/README.md` (content model) and `web/README.md` (rendering) for details.

## Getting started

- Install everything (root tooling + Git hooks + both packages) with one command:
  `npm run deps:install-clean`
- Then run a package: `cd studio && npm run dev` or `cd web && npm run dev`

## Development conventions

These are enforced automatically by Git hooks (Husky) configured from the root
`package.json`. To activate the hooks locally, run `npm install` once at the
repository root (the `prepare` script installs Husky). Studio and web are still
installed separately as before.

### Branch names

Branches follow `<type>/<description>` in lowercase kebab-case:

```
feat/about-page
fix/header-nav
docs/update-readmes
refactor/styles-tokens
```

- Allowed types: `feat`, `fix`, `docs`, `refactor`, `chore`, `ci`, `test`, `style`, `perf`, `build`.
- The long-lived branches `master`, `stage`, and `prod` are exempt.
- Enforced in `pre-push` — a push from a non-conforming branch is aborted.

### Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org) with a colon:

```
feat(web): rebuild home page gallery
fix(studio,web): sync types after schema change
ci: split web deploy into dedicated workflow
```

- `type` is required; `scope` in parentheses is optional.
- Enforced in `commit-msg` via Commitlint — a non-conforming message is rejected.

### Pre-commit / pre-push checks

- `pre-commit`: ESLint on staged files only (via lint-staged), then a full type check for each package that has changes (studio `npm run typecheck`, web `npm run check` = `astro check` + `tsc --noEmit -p functions`).
- `pre-push`: branch name validated, then a full type check for both packages.

## Dependency management

Dependency scripts live in the root `package.json` and operate across all three
packages (root tooling, `studio`, and `web`):

- `npm run deps:bump` — bump every dependency to the highest version that still
  satisfies its declared semver range in each `package.json`, then regenerate the
  lockfiles and run a clean install. Ends with `package.json` + lock +
  `node_modules` fully in sync.
- `npm run deps:lock-regenerate` — rebuild only the lockfiles from the current
  `package.json` ranges (use after manually editing a `package.json`). Does not
  touch `node_modules`.
- `npm run deps:install-clean` — wipe `node_modules` and reinstall exactly what the
  lockfiles pin (`npm ci` in root, studio, and web).

Typical workflow: run `npm run deps:bump`, review the changes, then commit the
updated `package.json` and `package-lock.json` files.

`web/.npmrc` sets `omit=peer`, so `@sanity/astro`'s Studio-only peer
dependencies (`sanity`, `styled-components`) are not installed in `web/`, which
uses the integration for its data client only. This is deliberate — only remove
it if the Studio is embedded in `web/`.

## Deployment

The site deploys to [Cloudflare Pages](https://dash.cloudflare.com) and the Sanity Studio to Sanity's hosted service. Nothing deploys on a git push — web deploys are started from GitHub Actions or from the Studio's **Deploy to stage** / **Deploy to prod** document actions, and promotions run from the **Promote Branch** workflow.

### Branch model

| Branch | Environment | URL |
|---|---|---|
| `master` | Integration (features merge here) | — |
| `stage` | Staging / preview | `https://stage.aparadecka-v2.pages.dev` |
| `prod` | Production | `https://agnieszkaparadecka.pl` |

`prod` is the Cloudflare **production branch**, so deploying `prod` publishes to production; every other branch (`stage`, etc.) publishes as a non-public preview.

### Promote a branch

Promotion does not happen automatically. Use the **Promote Branch** workflow (Actions → **Promote Branch** → Run workflow), choosing one of:

- `master -> stage` — push latest `master` onto `stage` for testing
- `stage -> prod` — promote tested `stage` to `prod` for release
- `master -> prod` — push `master` straight to production

The equivalent git commands are:

```sh
git push origin master:stage   # master -> stage
git push origin stage:prod     # stage -> prod
git push origin master:prod    # master -> prod
```

### Deploy the web app

Use the **Deploy Web** workflow (Actions → **Deploy Web** → Run workflow) with the **branch** input set to the target:

- `master` (default) → preview
- `stage` → preview at `https://stage.aparadecka-v2.pages.dev`
- `prod` → production at `https://agnieszkaparadecka.pl`

The same workflow also runs on the `content-rebuild` repository dispatch. That dispatch is **not**
sent by any code in this repository — it is wired up by a Sanity webhook (configured in Sanity)
that watches the `deploy.trigger` document. That document is what the Studio's **Deploy to stage** /
**Deploy to prod** document actions create; the workflow then writes progress back to a
`deploy.run.<branch>` document, which those same actions read to show deploy status.

The build derives `PUBLIC_SITE_ENV` from the deployed branch (`prod` → `production`, anything else
→ `preview`). The **CI** workflow is separate and only runs on push to `master` and on pull
requests — it does not deploy.

### Search indexing & sitemap

The web app serves `/robots.txt` (generated at build time from `web/src/pages/robots.txt.ts`) and a
sitemap at `/sitemap-index.xml` (generated by `@astrojs/sitemap`).

Which rules are emitted depends on the `PUBLIC_SITE_ENV` build var, set by **Deploy Web** from the
deployed branch:

- `prod` → `PUBLIC_SITE_ENV=production`: crawlable, with a `Sitemap:` line pointing at the canonical
  `https://agnieszkaparadecka.pl/sitemap-index.xml`.
- every other branch (e.g. `stage`) → `PUBLIC_SITE_ENV=preview`: `Disallow: /`, so previews stay out
  of search results.
- anything else (including unset) is treated as production; an unrecognised non-empty value also logs a
  build warning.

The rules **fail open** — only an explicit preview build is blocked — so a missing or misspelled variable
can never silently deindex the production site. Keep the canonical origin in sync with `web/siteUrl.ts`.

### Deploy the Sanity Studio

Use the **Deploy Studio** workflow (Actions → **Deploy Studio** → Run workflow) to redeploy the hosted Studio from `master`. The optional `deploy_schema` input also syncs the schema registry.

### Contact form email notifications

The contact form (`/kontakt`) emails each message to the page owner via the Cloudflare Email Service
REST API, called from the Pages Function at `web/functions/api/contact.ts`. The sender is
`kontakt@agnieszkaparadecka.pl`. Messages are **not** stored in Sanity — the owner's mailbox is the
only record.

- The recipients are the `CONTACT_NOTIFICATION_EMAIL` env var on the Pages project (set in the
  Cloudflare dashboard, not the CMS). Accepts a comma-separated list; **every** address must be a
  verified destination address in Cloudflare (Compute → Email Service → Email Routing → Destination
  Addresses), otherwise sending fails. Changing it means editing the env var and redeploying.
- Do **not** onboard "Email Sending" — routing-only is what keeps verified-destination sends free.
- The `aparadecka-v2` Pages project needs these env vars (Settings → Variables and Secrets, for both
  Production and Preview):
  - `CLOUDFLARE_ACCOUNT_ID`, `CONTACT_NOTIFICATION_EMAIL`, `CLOUDFLARE_EMAIL_API_TOKEN` (secret, permission **Account → Email Sending → Edit**), and optionally `CONTACT_FROM_EMAIL`.

  See `web/.dev.vars.example`.

### Contact form abuse protection

`/api/contact` enforces, in order: a same-origin `Origin` check (403), a per-IP rate limit (429,
KV-backed), and a Cloudflare Turnstile check.

- **Turnstile:** create a widget (Cloudflare dashboard → Turnstile → Add widget), mode **Managed**,
  for `agnieszkaparadecka.pl` and the `*.pages.dev` preview hostnames. The form shows it on
  `/kontakt` (`theme: light`), using the `flexible` size on wide columns and switching to `compact`
  below 200px, with a CSS scale fallback so it never overflows the card. Put the **Site Key** in the
  GitHub Actions variable `PUBLIC_TURNSTILE_SITE_KEY` (baked into the build; also set it in
  `web/.env` for local dev) and the **Secret Key** as the Pages secret `TURNSTILE_SECRET_KEY`
  (Production + Preview).
- **Rate limit:** create a Workers KV namespace (e.g. `contact-rate-limit`) and bind it to the Pages
  project as `CONTACT_RATE_LIMIT` (Settings → Functions → KV namespace bindings, Production +
  Preview). KV free tier is 100k reads / 1k writes per day. If the binding is missing, rate limiting
  is skipped — the Turnstile check still applies.

### Privacy notice

The contact form shows a short GDPR information clause (art. 13) under the submit button: the
controller, the purpose and legal basis (legitimate interest) and data-subject rights. No consent
checkbox is used and there is no separate policy page.

### Without JavaScript

With scripting disabled the form is hidden (via `<noscript>`) and replaced by a short message, so a
no-JS visitor cannot submit and nothing leaks into the URL. As a fallback for the case where
scripting is on but the submit script fails to run, the form still posts natively to `/api/contact`
(`method="post"`), and the endpoint answers such non-JSON posts with a `303` redirect back to
`/kontakt`.

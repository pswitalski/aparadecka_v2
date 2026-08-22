# aparadecka_v2

Artist portfolio site built with Astro and Sanity CMS, with a GitHub Actions CI pipeline.

## Structure

- `studio/` — Sanity Studio (content model + admin UI)
- `web/` — Astro site (frontend)

The **About page** is fully editable from the Studio: each section is a CMS block with rich text, an optional image, per-block text alignment, and image placement (left/right on desktop, above/under on mobile). See `studio/README.md` (content model) and `web/README.md` (rendering) for details.

## Getting started

- Install everything (root tooling + Git hooks + both packages) with one command:
  `npm run install:clean`
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

- `pre-commit`: ESLint on staged files only (via lint-staged), then a full type check for each package that has changes (studio `tsc --noEmit`, web `astro check`).
- `pre-push`: branch name validated, then a full type check for both packages.

## Deployment

The site deploys to [Cloudflare Pages](https://dash.cloudflare.com) and the Sanity Studio to Sanity's hosted service. All deploys and promotions are **manual** — nothing deploys automatically.

### Branch model

| Branch | Environment | URL |
|---|---|---|
| `master` | Integration (features merge here) | — |
| `stage` | Staging / preview | `https://stage.aparadecka-v2.pages.dev` |
| `prod` | Production | `https://aparadecka-v2.pages.dev` |

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

Use the **CI** workflow (Actions → **CI** → Run workflow) with the **Branch to deploy** input set to the target:

- `stage` → preview at `https://stage.aparadecka-v2.pages.dev`
- `prod` → production at `https://aparadecka-v2.pages.dev`

### Deploy the Sanity Studio

Use the **Deploy Studio** workflow (Actions → **Deploy Studio** → Run workflow) to redeploy the hosted Studio from `master`. The optional `deploy_schema` input also syncs the schema registry.

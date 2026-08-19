# aparadecka_v2

Artist portfolio site built with Astro and Sanity CMS, with a GitHub Actions CI pipeline.

## Structure

- `studio/` — Sanity Studio (content model + admin UI)
- `web/` — Astro site (frontend)

## Getting started

- Studio: `cd studio && npm i && npm run dev`
- Web: `cd web && npm i && npm run dev`

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

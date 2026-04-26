# Market Watch

Competitor monitoring dashboard for agent, payments, and community infrastructure.

## What it does

- Watches homepage, pricing, docs/changelog, jobs, and GitHub releases
- Captures normalized page text snapshots
- Diffs against the previous run
- Scores changes by business importance
- Produces a hosted dashboard and JSON API
- Commits refreshed market data via GitHub Actions
- Deploys to Cloudflare Workers / custom domain

## Local development

```bash
npm install
npx playwright install chromium
npm run monitor
npm run dev
```

## Quality checks

```bash
npm run test
npm run lint
npm run build
```

## Deploy to Cloudflare

```bash
npm run deploy
```

The app is configured for:
- Worker name: `market-watch`
- Custom domain: `market.luciana.digital`

## Data model

- `src/data/targets.json` — monitored companies + pages
- `src/data/generated/latest-report.json` — most recent report payload
- `src/data/generated/history.json` — recent historical summaries

## Automation

GitHub Actions workflows:
- `ci.yml` — test, lint, build
- `monitor-market.yml` — scheduled scan + commit refreshed generated data
- `deploy-cloudflare.yml` — auto-deploy on `main` when `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets are present

## Notes

This MVP stores generated market data in-repo so the hosted UI is static-friendly and easy to audit. If you later want authenticated editing, alerts, or user accounts, the natural upgrade path is Cloudflare D1 + queues.

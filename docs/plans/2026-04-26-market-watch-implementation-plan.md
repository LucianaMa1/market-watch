# Market Watch Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build and deploy a competitor monitoring app with V1/V2 features: target tracking, homepage/pricing/docs/jobs/GitHub release monitoring, diffing, scoring, daily and weekly brief views, GitHub-backed data updates, and live hosting at `market.luciana.digital`.

**Architecture:** Use a Next.js 16 App Router app for the dashboard and report views. Store monitored targets and generated snapshots as JSON files in the repo so GitHub Actions can run the scanner, commit fresh data, and trigger Cloudflare redeploys without needing a managed database. Use a local monitor pipeline with Playwright + feed/API fetches to gather content, compute diffs/scores, and emit normalized report data the UI can render.

**Tech Stack:** Next.js 16, TypeScript, Tailwind, Playwright, Zod, date-fns, rss-parser, GitHub Actions, Cloudflare Workers/OpenNext.

---

## Top-level tasks

1. Scaffold the app and monitoring script structure.
2. Define data schemas and seed targets.
3. Implement fetchers for homepage/pricing/docs/jobs/GitHub releases.
4. Implement snapshot diffing, scoring, tags, and action recommendations.
5. Build dashboard + report views.
6. Add GitHub Actions automation for daily/weekly refresh.
7. Verify locally, push to GitHub, deploy to Cloudflare custom domain.

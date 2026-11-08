# 0006. Static hosting on GitHub Pages

- Status: Accepted
- Date: 2026-11-07

## Context

The project must cost nothing to run, deploy automatically, and live next to its source.

## Decision

Deploy the built site to GitHub Pages with the official Pages actions on every push to `main`.
`VITE_BASE_PATH`, `VITE_SITE_URL` and `VITE_REPO_URL` are derived from the repository in the
workflow. Every route is prerendered (ADR 0013), and a generated `404.html` shell lets the client
router handle unknown paths.

## Alternatives considered

- **Netlify, Vercel or Cloudflare Pages**: comparable free tiers, but another account and another
  place to configure; useful later if edge rules or a CDN in front are needed.
- **Hash-based routing**: avoids the 404 shell, but produces unshareable URLs and no SEO.

## Consequences

- Hosting is free with a soft limit of about 100 GB bandwidth per month, far above expected use.
- On a project site (served under `/<repo>/`), crawlers do not read `robots.txt` or `llms.txt`
  from the sub-path; a user site or custom domain is needed for those to take effect.
- The repository settings must set the Pages source to "GitHub Actions".
- The deploy workflow runs only after CI succeeds on `main`, and deploys the commit CI tested.
  End-to-end tests run in parallel and do not gate the deploy; branch protection on `main`
  (required checks `CI` and `E2E`, pull requests required) is a manual repository setting that
  keeps red commits out of `main` in the first place.

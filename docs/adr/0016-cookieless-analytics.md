# 0016. Cookieless analytics with Cloudflare Web Analytics

- Status: Accepted
- Date: 2026-11-11

## Context

The maintainer wants to see traffic on the site. The audience is largely in Italy and the EU,
where cookies or identifiers that track individuals need prior consent, a banner and a cookie
policy. The code is public and forkable, so anything hard-coded would also ship on forks and send
their visitors' data to this project's account.

## Decision

Use Cloudflare Web Analytics: no cookies, no individual tracking, free, and one script tag. A Vite
plugin in `apps/web/vite.config.ts` adds the beacon only when `VITE_CF_ANALYTICS_TOKEN` is set.
The deploy workflow reads it from the `CF_ANALYTICS_TOKEN` repository variable, which forks do not
inherit. The token is public (it appears in the page), so it is a variable, not a secret; keeping
it out of the code is about forks, not secrecy.

The token doubles as the feature flag: unset means off, and rollback is deleting or emptying the
repository variable and redeploying.

## Alternatives considered

- **Google Tag Manager with Google Analytics 4**: richer event data, but sets cookies, needs a
  consent banner and cookie policy, and lets scripts change outside the repository.
- **GoatCounter, Plausible, Umami**: also cookieless; Cloudflare was chosen for zero cost and no
  hosting.

## Consequences

- No consent banner is needed; a short privacy note stating what is collected is still advisable.
- Reports are aggregate only (pages, referrers, countries, devices, Web Vitals), with no funnels.
- Adding GA4 later would need Consent Mode, a banner and a cookie policy, and a new ADR.

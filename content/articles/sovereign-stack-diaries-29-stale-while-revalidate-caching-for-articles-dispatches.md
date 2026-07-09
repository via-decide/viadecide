---
title: "Stale-While-Revalidate Caching for Articles Dispatches"
title_hi: "Stale-While-Revalidate Caching for Articles Dispatches"
excerpt: "Serving static journal articles quickly requires caching, but we also want new articles to appear instantly without manual cache flushing. We achieve this ..."
excerpt_hi: "Serving static journal articles quickly requires caching, but we also want new articles to appear instantly without manual cache flushing. We achieve this ..."
category: "article"
icon: "📄"
date: 2026-06-29
readTime: 1
featured: false
---

# Stale-While-Revalidate Caching for Articles Dispatches

Serving static journal articles quickly requires caching, but we also want new articles to appear instantly without manual cache flushing. We achieve this using the `stale-while-revalidate` cache directive.

Our edge servers configure article pages with `Cache-Control: public, max-age=86400, stale-while-revalidate=3600`. This allows CDN nodes to serve cached pages instantly, while revalidating the content in the background if it is older than 1 hour.

This caching strategy ensures fast page load times for readers, while guaranteeing that content updates propagate automatically across the network within an hour of deployment.

Built using: LogicHub · Aporaksha · Daxini · Zayvora

---
title: "The Cache-Control Paradox at the Cloudflare Edge"
title_hi: "The Cache-Control Paradox at the Cloudflare Edge"
excerpt: "A high Cloudflare edge cache hit ratio is critical for serving static assets quickly to remote users while shielding the local Mac Mini server from traffic..."
excerpt_hi: "A high Cloudflare edge cache hit ratio is critical for serving static assets quickly to remote users while shielding the local Mac Mini server from traffic..."
category: "article"
icon: "📄"
date: 2026-06-10
readTime: 1
featured: false
---

# The Cache-Control Paradox at the Cloudflare Edge

A high Cloudflare edge cache hit ratio is critical for serving static assets quickly to remote users while shielding the local Mac Mini server from traffic spikes. However, caching HTML pages poses a challenge: how do you ensure users receive instant updates without disabling the cache?

We resolved this by applying targeted `Cache-Control` headers. HTML pages are configured with `max-age=0, s-maxage=3600, must-revalidate`. This instructs browsers to always check with the edge server for updates, while allowing Cloudflare to cache the file for 1 hour.

For static assets (JS, CSS, images), we append content-hashes to the filenames, allowing us to cache them aggressively with `immutable, max-age=31536000`. This combination keeps edge hit ratios above 95% while ensuring code deployments take effect instantly.

Built using: LogicHub · Aporaksha · Daxini · Zayvora

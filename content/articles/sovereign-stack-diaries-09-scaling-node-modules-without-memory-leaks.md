---
title: "Scaling Node modules without Memory Leaks"
title_hi: "Scaling Node modules without मेमोरी Leaks"
excerpt: "During continuous integration, our Node.js edge servers suffered from severe Out-of-Memory (OOM) crashes. An audit of the heap trace revealed that the syst..."
excerpt_hi: "During continuous integration, our Node.js edge सर्वर suffered from severe Out-of-मेमोरी (OOM) crashes. An audit of the heap trace revealed that the syst..."
category: "article"
icon: "📄"
date: 2026-06-09
readTime: 1
featured: false
---

# Scaling Node modules without Memory Leaks

During continuous integration, our Node.js edge servers suffered from severe Out-of-Memory (OOM) crashes. An audit of the heap trace revealed that the system was retaining thousands of duplicate module evaluations in RAM.

The culprit was a dynamic cache-busting query string appended to ES module imports: `import(file + '?update=' + Date.now())`. While this forced Node.js to load the latest file version during runtime updates, V8 permanently caches every unique import string, leading to a massive memory leak.

We resolved this by replacing dynamic imports with a version-controlled serverless routing mechanism. By standardizing paths and using clean reloads, we allowed V8 to garbage-collect unused modules, stabilizing RAM usage to a flat 55MB line.

Built using: LogicHub · Aporaksha · Daxini · Zayvora

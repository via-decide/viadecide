---
title: "I train my AI on my own mistakes. Here's why that matters."
title_hi: "I train my एआई on my own mistakes. Here's why that matters."
excerpt: "Last night at 2 AM, I ran a script that pulled 917 commits and 322 pull requests from our 72 repositories."
excerpt_hi: "Last night at 2 AM, I ran a script that pulled 917 commits and 322 pull requests from our 72 repositories."
category: "article"
icon: "📄"
date: 2026-04-21
readTime: 3
featured: false
---

# I train my AI on my own mistakes. Here's why that matters.

Last night at 2 AM, I ran a script that pulled 917 commits and 322 pull requests from our 72 repositories.

Not someone else's data. Not scraped from the internet. Not a dataset I downloaded from Hugging Face.

My code. My team's code. Our bugs, our fixes, our 3 AM decisions.

That's how I train Zayvora.

Some context.

I'm building Zayvora — an AI reasoning engine that runs entirely on your machine.

No cloud. No API calls. No data leaving your laptop.

Most AI companies train on the internet. They scrape Reddit, Stack Overflow, Wikipedia, your blog posts. Then they charge you $20/month to search through it.

I took the opposite approach.

Zayvora learns from the code I actually ship. Every commit message. Every architecture decision. Every time I chose PostgreSQL over MongoDB and wrote down why.

Last night's extraction covered one week of work across 16 active repositories. 917 commits. Each one is a lesson Zayvora will remember.

Why does this matter?

Because when my teammate asks "how do we handle authentication?" — Zayvora doesn't give a generic Stack Overflow answer.

It says: "Here's exactly how we did it in  [daxini.xyz](http://daxini.xyz) . Line 234. Here's why we chose this approach. Here's the bug we hit last time."

That's not search. That's institutional memory.

ChatGPT knows everything about everyone. Zayvora knows everything about us. And for a team of 5 people building fast — that's infinitely more valuable.

The numbers from last night:

→ 72 repositories scanned → 16 repos had activity in the last 7 days → 917 commits extracted → 322 pull requests captured → Every diff, every file change, every decision — indexed

Total time: 12 minutes. Total cost: ₹0. Total data sent to any cloud: 0 bytes.

Some perspective.

Companies like Perplexity have raised $1.7 billion and built incredible search products that serve 100 million users. That's genuinely impressive work.

But they're solving a different problem.

They're building for the open internet. I'm building for teams and institutions that need their data to stay exactly where they put it.

I run my entire stack on a ₹37,000/month server. My team is 5 people. And I can deploy Zayvora inside an air-gapped room with no internet connection.

That's not better or worse. It's a different game with different rules.

What I learned building this way:

- 

Your own data is your best training data. Generic models give generic answers. Models trained on your mistakes give specific answers.

- 

Sovereignty isn't a feature — it's a philosophy. Every computation should be auditable. Every byte should stay where you put it.

- 

You don't need billions to build AI. You need clarity about what problem you're solving and for whom.

- 

The best moat is context. Once Zayvora knows your codebase, switching to ChatGPT feels like asking a stranger for directions in your own house.

I built my first hardware project in 2017 — an air mouse, before AI was a buzzword.

I've been building since then. Not because it's trendy. Because I believe Indians should have AI infrastructure they own, they audit, and they control.

That's what Zayvora is.

917 commits at a time.

 *Building Zayvora — India's sovereign AI reasoning engine.* &nbsp; *Founder, Daxini Systems* 

#AI #Sovereignty #BuildInPublic #IndianStartups #LocalAI #Zayvora

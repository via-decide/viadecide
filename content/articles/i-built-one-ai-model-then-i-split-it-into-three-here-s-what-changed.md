---
title: "I built one AI model. Then I split it into three. Here's what changed."
title_hi: "I built one एआई model. Then I split it into three. Here's what changed."
excerpt: "Six weeks ago, I shipped Zayvora — a local reasoning engine for engineers who think in systems."
excerpt_hi: "Six weeks ago, I shipped Zayvora — a local तर्क engine for engineers who think in systems."
category: "article"
icon: "📄"
date: 2026-04-12
readTime: 3
featured: false
---

# I built one AI model. Then I split it into three. Here's what changed.

Six weeks ago, I shipped Zayvora — a local reasoning engine for engineers who think in systems.

One model. One purpose. One command:

```

ollama run daxini2404/zayvora

```

It worked. Founders used it. Solo builders used it. People reasoning through architecture decisions used it.

But I kept seeing the same friction.

## The problem with one mode

Zayvora's core is a 6-stage reasoning loop:

```

Decompose → Retrieve → Synthesize → Calculate → Verify → Revise

```

That loop is powerful for hard decisions. But not every question is a hard decision.

Sometimes you just need to ship a PR.

Sometimes you need to synthesize 40 research papers, not debate trade-offs.

A reasoning engine that treats every question like a philosophy exam becomes noise. You start skipping the output because it's 800 words when you needed 80.

I was over-engineering responses to under-complicated questions.

## What I changed

I didn't retrain anything. I didn't add parameters. I didn't increase the model size by a single byte.

I split the system prompt into three distinct operational modes — each one built for a different kind of thinking:

 **Zayvora:Axiom**  — for decisions under uncertainty.

When you need to reason slowly, not confidently. When the wrong answer is worse than no answer.

 **Zayvora:Praxis**  — for builders who need to ship.

WHAT → WHY → HOW → WATCH OUT. Four lines. Then you move.

 **Zayvora:Nexar**  — for research and synthesis.

SIGNAL → EVIDENCE → GAPS → VECTOR. Surface what's true, not what sounds true.

## The same question. Three different answers.

I asked all three the same thing:

> "Should I use BM25 or dense embeddings for my RAG system?"

 **Axiom**  decomposed it into five sub-problems, flagged three assumptions I hadn't stated, worked through the math, and delivered a reasoned recommendation with caveats.

 **Praxis**  said: use BM25 first. It's faster to debug. Add dense when you know your failure modes. Here's how to set it up in 4 steps. Watch out for stale indexes.

 **Nexar**  surfaced what the literature actually says about hybrid retrieval, what BM25 misses at semantic scale, where the evidence is thin, and what question I should ask next.

Three different tools. Same 6-stage reasoning core underneath.

## Why this matters for local-first AI

Most people think model quality = parameter count.

It doesn't.

A 4.7GB model with the right operational frame outperforms a 70B model with the wrong one. Every time.

The system prompt is the architecture. The model is the hardware.

Zayvora:Praxis doesn't know more than Zayvora:Axiom. It just knows what kind of output you need, and it stops before it over-builds.

That's the entire insight.

## What I spent to get here

₹0.

No retraining. No fine-tuning. No GPU time. No cloud bill.

I spent time — which is the only thing I have to spend as a solo builder — thinking clearly about what each mode of reasoning actually requires.

Three Modelfiles. Three system prompts. One bash script to build them all.

That's the whole engineering delta.

## How to run it

```bash

ollama run zayvora:axiom    # for decisions

ollama run zayvora:praxis   # for building

ollama run zayvora:nexar    # for research

```

Or build all three locally in one command:

```bash

chmod +x build_ [zayvora.sh](http://zayvora.sh) 

./build_ [zayvora.sh](http://zayvora.sh) 

```

Everything runs on your machine. No API key. No cloud. No subscription.

## The rule I'm building by

 **One model family. Purpose-built modes. Zero framework debt.** 

Not every problem needs a new model.

Most problems need a clearer frame.

Zayvora:Axiom, Praxis, and Nexar are the same engine — running in the mode the problem actually requires.

That's the Daxini Stack philosophy: local-first, sovereign, and built for solo builders who don't have time for tools that think for themselves.

 **Dharam Daxini** 

Solo founder, ViaDecide · Gandhidham, Kutch

[ [daxini.xyz](http://daxini.xyz) ]( [https://daxini.xyz](https://daxini.xyz) ) · [@daxini2404]( [https://x.com/daxini2404](https://x.com/daxini2404) )

 *Zayvora Engine · Daxini Stack v0.9.1* 

 *Try it: ollama pull daxini2404/zayvora*

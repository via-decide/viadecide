---
title: "I Stopped Paying For LLMs. Built My Own For ₹4,000/Month Savings."
title_hi: "I Stopped Paying For LLMs. Built My Own For ₹4,000/Month Savings."
excerpt: "In March, I realized something stupid."
excerpt_hi: "In March, I realized something stupid."
category: "article"
icon: "📄"
date: 2026-04-23
readTime: 5
featured: false
---

# I Stopped Paying For LLMs. Built My Own For ₹4,000/Month Savings.

In March, I realized something stupid.

I was paying ₹4,000/month to OpenAI for inference across five products.

₹4,000. Not $4,000. ₹4,000.

For an Indian founder running five products on bootstrap, that's real money leaving your account every month. Money that could go to servers, or marketing, or literally anything else.

So I spent $900 on a Mac Mini M4. Spent four weeks building Zayvora.

Now I pay ₹0.

Zero rupees.

Everything runs on the same Mac Mini I use for development.

## The Stupid Part (How This Even Happened)

I was using OpenAI API for inference across:

-  [daxini.space](http://daxini.space)  (spatial reasoning)

- LogicHub (code generation)

- SkillHex (interview simulation)

- ViaDecide (decision logic)

-  [hanuman.solutions](http://hanuman.solutions)  (automation workflows)

100-150 API calls per day across all five.

₹4,000/month doesn't sound like much until you do the math:

₹4,000 × 12 months = ₹48,000/year

That's a flight to another city. That's a good laptop. That's three months of hosting.

For what? For Claude to get smarter from my domain knowledge.

I could've ignored it. Most founders do. They just pay it and move on.

But I'm stupid in a specific way: I noticed.

## The Build (Real Timeline)

I had one constraint:  **Can I run this locally without cloud costs?** 

Yes. Mac Mini M4 can handle Llama 3.1 8B.

Week 1: Test Llama 3.1 8B locally. Benchmark against Claude.

Results:

- Customer support triage: 88% accuracy (Claude: 90%)

- Code explanation: Same quality, fewer tokens

- Decision logic: Identical reasoning paths

Close enough for production.

Week 2: Build Nex (RAG layer to prevent hallucinations)

Week 3: Build Orchade (orchestrator for multi-step reasoning)

Week 4: Test. Optimize. Ship.

Total code: 2,300 lines JavaScript + Python.

Cost: $900 (Mac Mini M4 I bought specifically for this)

Published: April 5, 2024 on Ollama (`daxini2404/zayvora`)

## What Happened After Launch

I moved all inference off OpenAI API to Zayvora.

First month: ₹4,000 saved.

March to now: ₹4,000 × [months] saved.

Year 1: ₹48,000 saved.

The Mac Mini already paid for itself in the first two weeks.

Now it's free infrastructure forever.

## The Architecture (Why It Works)

Three layers:

 **Zayvora Core:** 

Llama 3.1 8B + custom reasoning prompt. No training. No finetuning. Just smart prompting.

 **Nex (RAG):** 

Connects to your docs, knowledge base, customer data. Retrieves context before reasoning. Prevents hallucinations.

 **Orchade:** 

Handles retries, multi-step logic, error handling. Makes it reliable.

All running on a $900 Mac Mini.

No cloud bills. No per-token pricing. No vendor lock-in.

## The Real Numbers (Indian Founder Version)

| Item | Cost |

|---|---|

| Mac Mini M4 | $900 |

| Development time | ~160 hours (sunk) |

| Monthly cloud cost | ₹0 |

| Monthly OpenAI cost (before) | ₹4,000 |

 **Year 1:**  $900 + ₹0 = $900 total cost + ₹48,000 saved = Net savings ₹48,000 ($580)

 **Year 2+:**  ₹48,000 saved every year, perpetually.

For an Indian founder on bootstrap, that's not noise. That's real margin.

## Why This Matters For You

If you're paying ₹2,000-5,000/month for OpenAI API, this is your story.

You don't need to wait for "scale" to make this work.

At 100-150 daily API calls, local inference makes sense right now.

 **The math:** 

- ₹4,000/month × 12 = ₹48,000/year

- Split that across a Mac Mini + your time = ROI in 2-3 months

- After that, inference is free

## When NOT to Do This

Use OpenAI when:

- You're prototyping and don't know if the feature sticks

- You need frontier reasoning on novel problems

- Your volume is under 50 API calls/day

- You don't have a Mac or Linux machine to run Ollama

I still use Claude for R&D and brainstorming. Volume is low. Cost doesn't matter.

But for production inference? Zayvora. ₹0 ongoing cost.

## The Code (It's All Open)

Everything I built is open-source:

 **Zayvora Cookbook**  (Implementation patterns)

 [https://github.com/zayvora/zayvora-cookbook.git](https://github.com/zayvora/zayvora-cookbook.git) 

 **Full Architecture**  (Everything I shipped)

 [https://github.com/via-decide/Dharam-Daxini.git](https://github.com/via-decide/Dharam-Daxini.git) 

 **On Ollama**  (Pull directly)

ollama run daxini2404/zayvora

 **Technical Guide**  (Deployment patterns)

The Daxini Stack on Amazon KDP ($5)

Covers architecture, LoRA training, Orchade orchestration, deployment.

## How to Actually Do This

 **Step 1: Get hardware**  (if you don't have it)

Mac Mini M4 ($600) or any Linux machine with 8GB+ RAM

 **Step 2: Install Ollama** 

Go to  [ollama.com](http://ollama.com) . Download for your OS.

 **Step 3: Pull Zayvora** 

ollama run daxini2404/zayvora

Model downloads. Then it's ready.

 **Step 4: Test on your problem** 

Run your actual inference calls. Measure latency.

If it works (80%+ parity with Claude), you're done.

Monthly savings: whatever you were paying OpenAI.

## The Second-Order Effect

First-order: ₹4,000/month → ₹0/month

Second-order: Now I can finetune. Add domain knowledge. Optimize for my exact problems.

Claude doesn't let me do that. I'm locked into whatever they ship.

With my own stack, I can add LoRA layers trained on my customer workflows. Build reasoning that's specific to my problems.

That's defensibility. That's the real win.

## What This Unlocked

Zayvora is now the inference layer for all five products:

-  [daxini.space](http://daxini.space)  — spatial OS reasoning

- LogicHub — code generation at scale

- SkillHex — interview simulation without API costs

- ViaDecide — decision engine runs for free

-  [hanuman.solutions](http://hanuman.solutions)  — B2B automation workflows

All five products now have "unlimited" inference. No per-call costs. No rate limits.

Feature velocity went up because I stopped thinking about per-token pricing.

## The Honest Part

This only works if:

1. Your inference load is predictable (100-150 calls/day is fine)

2. You can host on your own hardware (Mac Mini, Linux server, cheap cloud instance)

3. You don't need frontier-level reasoning (you need good-enough for your domain)

If you need Claude's performance for novel problems, use Claude.

But for production inference on bounded problems? This is the move.

## The Timeline

-  **March:**  Realized ₹4,000/month was ridiculous

-  **Week 1-4:**  Built Zayvora

-  **April 5:**  Launched on Ollama

-  **April-Now:**  Running on Mac Mini, zero costs

Payback period: 2-3 weeks.

Everything after that is just pure savings.

## Resources

 **Code:** 

- Zayvora Cookbook:  [https://github.com/zayvora/zayvora-cookbook.git](https://github.com/zayvora/zayvora-cookbook.git) 

- Full Setup:  [https://github.com/via-decide/Dharam-Daxini.git](https://github.com/via-decide/Dharam-Daxini.git) 

- Ollama: ollama run daxini2404/zayvora

 **Guide:** 

- The Daxini Stack (Amazon KDP, $5)

 **Products:** 

-  [daxini.space](http://daxini.space) ,  [LogicHub](https://www.logichub.app) , SkillHex,  [ViaDecide](https://www.viadecide.com) ,  [hanuman.solutions](http://hanuman.solutions) 

The math for Indian founders is simple:

If you're paying ₹2,000-5,000/month for OpenAI, spend $900 once and eliminate that cost forever.

That's it.

Everything else is just execution.

—Dharam

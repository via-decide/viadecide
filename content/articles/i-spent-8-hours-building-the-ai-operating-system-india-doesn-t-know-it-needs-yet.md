---
title: "I Spent 8 Hours Building the AI Operating System India Doesn't Know It Needs Yet"
title_hi: "I Spent 8 Hours Building the एआई Operating सिस्टम India Doesn't Know It Needs Yet"
excerpt: "I"
excerpt_hi: "I"
category: "article"
icon: "📄"
date: 2026-04-13
readTime: 8
featured: false
---

# I Spent 8 Hours Building the AI Operating System India Doesn't Know It Needs Yet

I'm writing this at 6 AM from Gandhidham, Kutch.

Battery at 17%. Chai gone cold. Five browser tabs open, each one a different piece of an ecosystem I've been quietly assembling for months.

Last night I didn't sleep much. I was building. And by the time the sun came up over Kutch, something had shifted — not just in the codebase, but in my head. I finally saw the full picture clearly enough to write it down.

This is that article.

It's not a product announcement. It's not a fundraising pitch. It's a sprint log — raw, honest, technically dense — from someone who believes India is about to leapfrog the global AI stack if the right people build the right foundations. And I want to show you exactly what that foundation looks like, layer by layer, because I've been living inside it for eight straight hours.

```

```

Two years ago, I got rate-limited at 2 AM in the middle of something that mattered.

I was deep in a reasoning problem. My thought was unfinished. And a remote API — thousands of kilometers away — decided I had used enough tokens for the evening.

That moment produced a question that won't leave me alone:  **Why am I renting my own intelligence?** 

Every query I make goes overseas. Every API call trains someone else's model. Every token I spend is someone else's data point. If I'm rate-limited, I stop thinking. If the terms change, I have to pivot. If the service shuts down, I restart from nothing.

Linus Torvalds built Linux from a dorm room in Finland because he didn't want to depend on someone else's Unix. Richard Stallman built the GNU project because he believed software freedom meant owning your tools, not renting them. Both of them started from the same place: tired of being told they had used enough.

I started the same way.

So I built an alternative. Not because I had funding. Not because I had a team. Because I had a Mac Mini, a fiber connection, and the kind of stubbornness that runs in families.

```

```

The centerpiece of everything is Zayvora — a custom fine-tuned Llama 3.1 8B model optimized specifically for engineering reasoning.

Let me be precise about what that means, because "AI model" has become meaningless. Everyone has an AI model. What most people don't have is a reasoning architecture that shows its work.

Zayvora runs a six-stage reasoning loop:

Every single query goes through all six stages. Every stage is inspectable. When Zayvora gives you an answer, you don't just get the answer — you get the entire chain of thought that produced it, broken into discrete, auditable steps.

Why does this matter for engineers specifically?

Because engineering is not about answers. Engineering is about  *reasoning under uncertainty* . The question isn't "what is the answer?" The question is "how confident are we in this answer, and what would change it?"

A model that just gives you an answer is a calculator with a confident tone. A model that shows you DECOMPOSE → RETRIEVE → SYNTHESIZE → CALCULATE → VERIFY → REVISE is a colleague.

Last night, I published Zayvora to Ollama. As of this morning: 9 pulls. Five of them from external users — people I've never met, who found it through the registry and pulled it down and ran it on their machines. That's zero marketing, zero paid distribution, zero VC money behind it.

Nine pulls feels small. I know that. But I remember reading how the first person downloaded Linux outside of Linus Torvalds' university. Small numbers at the start of something real look exactly like this.

The next phase includes a PR-based incremental training pipeline. Every architectural decision I make, every GitHub PR I merge, every security pattern I implement — gets extracted as a reasoning trace and folded back into the next LoRA adapter training run. The model learns from my actual engineering work, continuously, without me having to curate a dataset manually.

That's a continuous training loop. That's how you build a model that genuinely gets smarter at the specific things you care about.

A powerful model locked in a terminal is just a research toy.

The reason I spent hours on  [daxini.xyz](http://daxini.xyz)  last night is that the interface is where power becomes accessible. And accessible power is the difference between a tool and a platform.

 [Daxini.xyz](http://Daxini.xyz)  is designed as an AI research operating system — not a chat interface, not a dashboard, but an  *operating system*  for engineering thought.

It has four main modules:

 **The Zayvora Reasoning Console**  — where you enter a prompt and watch the six-stage reasoning loop execute in real time. Not a spinner. Not a loading bar. An actual live trace of the model decomposing your question, retrieving relevant context, synthesizing competing information, calculating outputs, verifying against constraints, and revising its conclusions. Transparent AI, by design.

 **The Knowledge Graph**  — where my research articles and engineering decisions exist as nodes in a connected network, not a flat list of blog posts. You can traverse the graph, follow citation chains, find connections between ideas that aren't obvious in linear reading. This is how knowledge should be organized — spatially, relationally, not chronologically.

 **The GitHub Ecosystem Panel**  — a live view of every repository in the via-decide organization. Not a portfolio page. A live feed of actual engineering work happening in real time, with commit histories and PR states visible.

 **The Interactive Stack**  — a layered visualization of how Zayvora, Daxini, SkillHex, and the rest of the ecosystem fit together. Not a pretty diagram from a pitch deck. An interactive architectural map.

There's an honest admission I need to make here: last night, the reasoning loop was getting stuck at "Initializing." I know exactly why — the reasoning pipeline events aren't fully wired to the API integration yet. The fix is in my head, and it'll be in the codebase before this article finishes spreading.

I'm telling you this because I think the culture of hiding unfinished work is one of the most destructive things in tech. Founders pretend products are perfect until they crumble publicly. I'd rather you watch me fix things in real time than discover the cracks later.

Now, SkillHex is the infrastructure that makes reasoning measurable.

If Zayvora is the thinking partner and Daxini is the environment where thinking becomes visible, then SkillHex is the institution that recognizes what you've actually proven.

SkillHex is designed as a skill matrix and performance scoring system that produces an engineering reputation — a composite signal of your actual capabilities, derived from real evidence, not self-reported claims.

Here's the business model, and I'll be transparent about it:  **Engineers use SkillHex free. No paisa from you. Ever.** 

You track your own skill growth. You run simulators. You see your reasoning patterns. You understand your own performance.

Recruiters pay for access to verified engineer profiles. That's where the model works: companies wanting signal instead of noise in their hiring pipelines, willing to pay for engineers who can prove what they can actually do.

The reason this works is obvious: if you're good, you want your profile visible to companies willing to pay for real talent. If you're learning, you want to see yourself improve without someone else profiting from your data.

Here's what I want you to understand about why this sprint matters beyond just the technical output.

Most engineers I know are caught between two false choices: speed or quality. Move fast and break things, or move slow and be perfect. Iterate rapidly, or think deeply.

The six-stage reasoning loop I'm building into Zayvora is not just a model architecture. It's a development methodology.

Before I touch code, I decompose the problem. Before I design a solution, I retrieve relevant decisions from the past. Before I commit to an approach, I synthesize competing ideas. Before I ship, I calculate implications. I verify against constraints. I revise when I'm wrong.

This is what engineering actually looks like when you're building something meant to last. Not vibes. Not hackathon energy. Not move-fast-and-break-things. Systematic, inspectable, revisable reasoning under constraint.

And here's what I think matters for people reading this from Bangalore, Delhi, or Mumbai:

You don't need permission to build this way. You don't need venture capital. You don't need a Bangalore address. You don't need to move to Silicon Valley. You need one thing: to stop accepting the premise that you have to choose between where you're from and what you're capable of building.

I'm building from Gandhidham. My father built a career from Gandhidham in 1988 without asking anyone's permission. Different era. Different tools. Same city. Same instinct.

I want to end with something honest, because I think the startup content ecosystem is drowning in dishonest optimism.

Eight hours of work produces architecture, not a product. The things I described above exist at different levels of completion — some are running, some are planned, some are partly built, some are still in my head. I'm being transparent about that.

But here's what this sprint actually proves, and why I think it matters beyond just my ecosystem:

 **A single developer with the right architecture can build more leverage than a team without one.** 

The Daxini Stack took three months to get to this point. Four systems. Two books. One model on Ollama. One newsletter that attracted ISRO scientists and engineers from all over the country.

Not because I'm special. But because I stopped accepting that I had to rent my intelligence.

Nine pulls on Zayvora. That's how it starts.

 *Dharam Daxini is a solo founder and developer based in Gandhidham, Kutch, building the ViaDecide sovereign digital ecosystem. * 

 *He writes about local-first AI, engineering reasoning, and building in public from Bharat.* 

 *Zayvora is available on Ollama: *  [ *ollama.com/daxini2404/zayvora* ](http://ollama.com/daxini2404/zayvora*) 

 *The Daxini Stack is documented on Amazon KDP. SkillHex is in development.* 

 *Follow for sprint logs, architecture breakdowns, and the occasional 6 AM dispatch from Kutch.*

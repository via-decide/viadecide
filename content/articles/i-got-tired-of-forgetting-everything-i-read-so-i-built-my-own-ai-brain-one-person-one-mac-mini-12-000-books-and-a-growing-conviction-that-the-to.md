---
title: "I Got Tired of Forgetting Everything I Read. So I Built My Own AI Brain. One person. One Mac Mini. 12,000 books. And a growing conviction that the to"
title_hi: "I Got Tired of Forgetting Everything I Read. So I Built My Own एआई Brain. One person. One Mac Mini. 12,000 books. And a growing conviction that the to"
excerpt: "I have a confession that most people who know me would find surprising."
excerpt_hi: "I have a confession that most people who know me would find surprising."
category: "article"
icon: "📄"
date: 2026-04-06
readTime: 17
featured: false
---

# I Got Tired of Forgetting Everything I Read. So I Built My Own AI Brain. One person. One Mac Mini. 12,000 books. And a growing conviction that the to

I have a confession that most people who know me would find surprising.

I read obsessively. I always have. Philosophy, systems thinking, cognitive science, history, technology, economics — if it has ideas in it, I want it. I have a reading list that will outlive me. I treat books like infrastructure, not entertainment. I annotate in the margins. I highlight. I take notes in notebooks I actually go back to. I dog-ear pages like it means something.

And then, reliably, three months later — it's gone.

Not all of it. But enough. Enough that I'll be in the middle of a conversation, reaching for an idea I know I read somewhere — a specific argument, a counterintuitive finding, a framing that completely reoriented how I thought about a problem — and I'll come up empty. Enough that the hours I spent with a book start to feel like they half-dissolved into fog. Enough that reading, for all the genuine pleasure it gives me, started to feel like an expensive hobby rather than a lasting investment.

If you're a reader, you probably know this feeling exactly. You finish a great book. You feel sharper, more informed, like the world makes slightly more sense. Two weeks later you can struggle to recall the author's central argument. A month later the specific examples are gone. What's left is a vague impression — something about decision-making, or history, or human nature — floating unattached to the evidence and reasoning that made it compelling in the first place.

For a long time I told myself this was a discipline problem. I needed better notes. More structured reviews. A proper system. I tried everything: physical notebooks, digital notes, spaced repetition flashcards, summary documents, elaborate tagging schemes in apps that promised to solve exactly this problem. Some of it helped. None of it solved it.

Eventually I arrived at an uncomfortable conclusion: the problem wasn't my discipline. The problem was structural.

Human memory was never designed for the volume and density of information we now consume. Our brains are pattern-recognition machines, not archives. We evolved to remember threats, relationships, emotional experiences, physical skills — not to store and retrieve thousands of precisely worded arguments across dozens of disciplines. We were never meant to be the database. We were meant to do the thinking.

But for most of human history, we've been forced to play both roles — storage and processor — and we were never very good at the first one. Libraries, filing systems, indexes, encyclopaedias: these were all attempts to solve the same problem at a civilisational level. Now we face it individually, at a scale that would have seemed impossible to previous generations.

That feeling — knowledge slipping through your fingers, effort not compounding the way it should — is what started everything.

It was late. Way too late. The kind of late where you should close the laptop, accept that tomorrow exists, and go to sleep like a reasonable person.

I was trying to cross-reference an idea across four different books. I had the books. I had the notes. I had the rough memory that this specific connection was covered somewhere — possibly in the third book, possibly in the first, possibly in a paper I'd read after the second. Twenty minutes later, I was still hunting. Ctrl+F across four PDFs. Scanning handwritten notes in a notebook I hadn't opened in months. Rereading chapter summaries that somehow said everything except the thing I actually needed.

I sat back and had a thought that changed everything: a researcher at a university doesn't work like this.

Research institutions don't rely on the individual researcher's memory. They build systems. Infrastructure. Catalogues developed over decades. Tools that make retrieval feel effortless — so the human can focus entirely on the thinking, not the finding. The scholar doesn't have to remember which shelf the relevant paper is on. The system knows. The scholar can direct all their cognitive energy toward the actual problem.

And then the second thought, quieter but somehow more electric: why don't I have that?

Not because I couldn't access it. Not because it required a PhD or a department budget or an institutional affiliation. But because no one had built it yet — for an individual, running on personal hardware, organised around a private library. The tools existed in pieces. The underlying technology was available. Someone just had to actually sit down and put it together.

That someone might as well be me.

I didn't go to bed that night. I started reading about vector embeddings instead.

Here's the thing about building your own AI ecosystem as a solo founder: nobody's roadmap looks like yours. There is no tutorial for "build a personal research institution in your apartment." You're making strange decisions at midnight that somehow, over months, accumulate into architecture.

Let me walk you through what actually exists now — not as a pitch, but as a genuine attempt to show how these things compound when you follow the problem honestly.

It starts with the corpus. I began processing my personal library — not digitising it in the traditional sense, but ingesting it. Running books through a pipeline I built from scratch: extract the raw text, break it into meaningful semantic chunks, convert those chunks into high-dimensional vector embeddings, load everything into a database built specifically for similarity search.

The principle behind this is worth understanding because it's what makes it genuinely different from search as most people know it. When you type a query into a conventional search engine, it looks for documents that contain your exact words, or close variants. It's matching strings. But when you ask a semantic search system a question, it converts your query into the same kind of numerical vector representation it used to store the text in the first place. Then it finds the passages whose vectors are "closest" to your query vector — closest in meaning, not in keywords.

This is why you can ask a system like this "what makes people irrational under pressure?" and surface relevant passages from a neuroscience textbook, a behavioural economics study, a Stoic philosophy essay, and a military history book — even if none of them ever used your exact phrasing. The system understands what you're asking for at a conceptual level, and matches it to content that encodes similar concepts, regardless of the specific words used.

Over time, that library grew to more than 12,000 books. All of it sitting on a Mac Mini, quietly waiting to be asked something.

On top of that foundation I built four interconnected systems.

 *Nex*  is the research engine — the layer that makes the corpus usable for actual research. You ask real questions, it surfaces real ideas. Not a list of results to click through. Not a pile of links to skim. Synthesised knowledge drawn from a curated private library — the difference between Googling something and asking an exceptionally well-read colleague who happens to have perfect recall across everything they've ever encountered.

 *Zayvora*  goes a level deeper. If Nex is the retrieval layer, Zayvora is the reasoning layer. It's the system I actually talk to when I'm working through a hard problem. It doesn't just find relevant material — it thinks with it. Connects threads across disciplines. Pushes back on weak arguments. Offers angles I hadn't considered. It operates on the private corpus, which means its reasoning is grounded in the specific body of knowledge I've built, not a generic snapshot of the internet.

 *StudyOS*  is the fourth piece — a more structured system built specifically for situations where knowledge needs organisation, not just retrieval. Competitive exam preparation. Deep subject mastery. The kind of learning that benefits from curriculum architecture and sequenced progression, not just a smart search bar.

All of it runs locally. On one Mac Mini. Using open models and self-built tooling. No cloud subscriptions quietly draining money in the background. No third-party data dependencies. No black box I can't inspect or modify. A private, sovereign knowledge infrastructure — mine entirely, getting more useful the more I put into it.

People romanticise solo building. And parts of it genuinely are romantic — the freedom, the speed, the absence of meetings and consensus-building and the particular exhaustion of having to justify every decision to someone who wasn't there for the previous ten decisions. The quiet pleasure of waking up and just building.

But there's another part. The part where you're three hours into a problem with no clear solution and no one to ask. The part where you're genuinely unsure whether you're constructing something meaningful or building an elaborate distraction that feels like work but might be procrastination wearing a technical disguise. The part where the silence of having no co-founder to sanity-check your thinking transitions, somewhere around month three, from peaceful to quietly unnerving.

The thing that kept me going was something deceptively simple: the system was actually working for me.

Not in a theoretical, "I believe this will eventually pay off" sense. In a concrete, week-over-week, measurable sense. My ability to research a topic went from an hour of scattered, frustrating searching to fifteen minutes of precise, satisfying querying. My recall improved — not because my memory had gotten better, but because I had stopped relying on it. The system remembered. I could direct my energy toward the thinking.

That feedback loop — the feeling of genuinely working faster, of problems getting easier, of connections surfacing more readily — was more motivating than any external validation could have been. Each improvement to the system made me more effective at my work. Being more effective motivated me to improve the system further. The compounding started slowly and then, somewhere around month five, became unmistakable.

There's an underrated advantage to building for yourself that I don't think gets discussed enough: radical honesty. When you're the primary user of something you built, you cannot fake usefulness to yourself. You know immediately, viscerally, whether the thing you made actually works — or whether you've been constructing an impressive-looking system that doesn't, in practice, make you any better at your job. You are the most honest user you will ever have.

This system worked. I knew it because I could feel it in the quality of my thinking, in the speed of my research, in the connections I was making that I simply wasn't making before.

I want to say something that might sound dramatic, but that I believe more firmly the longer I work in this space.

We are in the middle of a genuinely historic shift in what a single person can build — and most people are still treating it like a novelty or a productivity trick.

For most of human history, the gap between an individual and an institution wasn't primarily a question of money or status. It was a question of infrastructure. Research teams had indexing systems and shared institutional memory. Libraries had catalogues built and refined over decades. Organisations had processes — formal and informal — for capturing, storing, cross-referencing, and retrieving knowledge at scale.

Individuals had notebooks and willpower. And we struggled, not for lack of effort or intelligence, but because the tools that multiply cognitive capacity were locked behind institutional walls.

Five years ago, what I've built would have required a team of machine learning engineers, a six-figure cloud infrastructure budget, and probably a Series A round to fund it. The technical knowledge to build sophisticated retrieval systems lived inside a handful of well-funded research labs and large technology companies. The compute required was genuinely prohibitive for a single person.

That has changed, and it has changed faster than almost anyone predicted.

Open-source embedding models have matured at a pace that still surprises me when I stop to think about it. Vector database technology is now well-documented, accessible, and built for exactly the kind of use case I'm describing. The foundational knowledge required to assemble these systems — the same knowledge that powers enterprise AI products at scale — is freely available to anyone with the curiosity and stubbornness to learn it. The hardware capable of running this infrastructure sits on a desk in my home.

This is not a small thing. We are watching the democratisation of cognitive infrastructure happen in real time, and most of the commentary around it is focused on chatbots and productivity apps, missing something far more significant underneath.

The individuals who understand this moment — who sit down and actually build personal knowledge infrastructure instead of waiting for a polished consumer product to do it for them — are going to operate at a level that looks almost unfair from the outside. Not because they have the most resources. Not because they're the most talented. But because they understood the moment early enough to build exactly what they needed, tailored precisely to how they think and what they work on.

The tools to give a single person the working capacity of a research team are not a future promise. They exist now. The gap is actively closing. The only variable is who's paying attention and doing the work.

There's a conversation happening around AI in education and knowledge work that I think is missing the most important point.

The debate tends to oscillate between two positions. On one side: AI is a threat, enabling shortcuts, undermining real learning, making people intellectually dependent. On the other: AI is a gimmick, a slightly better search engine wrapped in a chat interface, useful for drafting emails but not transformative in any meaningful sense. Both framings miss what's actually possible.

The real opportunity isn't to make learning easier in the sense of reducing effort. It's to make learning more effective — to close the gap between time invested and knowledge retained, between information consumed and genuine understanding developed, between reading and thinking.

Consider what it means for a student preparing for a high-stakes examination to have access to a curated corpus of the world's best thinking on their subject, semantically indexed and available for genuine reasoning — not a system that writes answers for them, but one that helps them understand why arguments matter, how they connect to each other, where the real tensions and open questions lie. The effort is still theirs. The understanding is still theirs. But the scaffolding — the infrastructure that makes effort translate more reliably into comprehension — is now something a single person can build and own.

Consider what it means for a researcher, a writer, a consultant, or a founder never to lose a connection between ideas — because their entire knowledge base is semantically indexed, always searchable, always available, growing more useful with every book they add to it. Not a replacement for expertise. An amplifier of it.

This is the distinction that matters: automation replaces, amplification extends. The goal is not to build tools that think for people. The goal is to build infrastructure that helps people think better — faster retrieval, deeper connections, less forgetting, more synthesis, more of the intellectual payoff that all of us who read and learn and study are actually chasing.

The augmented individual isn't someone who has delegated their thinking to a machine. They're someone with institutional-grade cognitive infrastructure, running on personal hardware, organised around their specific knowledge, goals, and way of working. They still do the thinking. They just do it with tools that are finally commensurate with their ambition.

I almost didn't write any of this. For a long time it felt too unfinished — too personal, too difficult to explain without either sounding like I was bragging about a side project or admitting to an expensive obsession that reasonable people would quietly question.

Here's the honest truth about why things look polished when you read about them online: you only ever see the version after the person decided it was worth sharing. You don't see the failed prototypes, the weeks where nothing worked, the pipeline that broke for reasons that turned out to be embarrassingly simple, the moments of genuine doubt about whether you've spent months on something that will matter to no one, including yourself.

I kept seeing people describe the same original frustration — drowning in information, starving for actual insight. Reading constantly, retaining barely. Working hard to learn things and feeling like the knowledge dissolved before it could compound into something useful. And I thought: someone should be talking about this differently. Not as a polished product launch, not as a think-piece about the abstract future of AI, but as a live experiment, genuinely in progress, with the rough edges intact.

There's a practical argument for building in public that I've come to believe strongly. It creates accountability. It forces clarity of communication — and clarity of communication almost always produces clarity of thinking. When you have to explain what you've built to someone who wasn't present for any of the decisions, you understand it better yourself. You find the holes in your reasoning. You spot the assumptions you'd stopped questioning.

But there's a deeper reason, one I find harder to articulate without sounding self-important. We are in the early phase of something genuinely transformative, and the people shaping that phase should not only be large companies working behind closed doors with carefully managed press releases. The experiments happening in home offices — on personal Mac Minis, with open models and self-built pipelines, by people who started because they had a problem they personally couldn't solve — these experiments matter. They're a form of research and development that the broader ecosystem needs, even if nobody's officially funding it.

If one person reads this and gets the nudge to start building their own version — their own personal knowledge engine, their own cognitive infrastructure tailored to how they work — then every hour spent writing it was worth it. The idea compounds when it spreads.

I started this because I was frustrated about forgetting things I'd read. A small, personal problem that turned out to have a surprisingly deep solution.

Somewhere along the way it became something larger. A conviction about what individual builders can accomplish right now, in this specific window of time when the tools have matured but the obvious paths haven't yet been saturated. A belief that personal knowledge infrastructure is going to matter enormously in the next decade — not as a corporate product category, but as a genuine capability gap between people who build it and people who don't. A genuine excitement about where this goes as the underlying models improve, as the patterns become clearer, as more people realise what's actually possible.

But mostly, it's still just the thing I needed. A system that remembers so I can think. Infrastructure that works so I can focus entirely on the problems worth focusing on. A research institution of one — the one that's been here all along, just finally properly equipped.

We were never supposed to be the database. We were supposed to do the thinking.

The tools to separate those two roles — to hand the storage problem to a machine and reclaim all of that cognitive space for actual reasoning — exist right now, today, available to anyone with enough curiosity and stubbornness to put them together.

The tools are real. The moment is real. The window is open.

The only thing left is to actually build.

Solo founder building Zayvora, Nex, StudyOS, and a 12,000-book AI corpus — locally, in public, one late night at a time. This is an experiment in what one person can build when the tools finally catch up to the ambition. Follow for more on personal AI infrastructure, knowledge systems, and the future of how we learn and think.

---
title: "How I Turned Building ViaDecide Into an Interactive Founder Documentary"
title_hi: "How I Turned Building ViaDecide Into an Interactive Founder Documentary"
excerpt: "Most startup stories are told after they succeed."
excerpt_hi: "Most स्टार्टअप stories are told after they succeed."
category: "article"
icon: "📄"
date: 2026-03-07
readTime: 3
featured: false
---

# How I Turned Building ViaDecide Into an Interactive Founder Documentary

Most startup stories are told after they succeed.

I'm experimenting with telling one while it's being built — and letting viewers choose the path.

I accidentally built a programmatic documentary engine.

About two months ago I started working on something much simpler: an input system that could feel new for users in 2026.

The idea was to rethink something boring — form filling. Instead of static forms, I wanted interactions that felt closer to swiping, choosing, and progressing through decisions.

But while building it, something unexpected happened.

The development history itself started looking like a story.

So I started turning that journey into an interactive video series — something closer to Man vs Wild on Netflix, but for builders.

A system where viewers don’t just watch the journey…

they choose what happens next.

What exists today

From a single "production.json" file the system can generate:

• 10 main video episodes

• 36 narrative branches

• Interactive decision points

• YouTube-ready end screen paths

Each branch is mapped like a graph so the story never breaks.

The renderer converts the JSON into actual video scenes automatically.

The architecture behind it

What surprised me most is that the code wasn’t the hard part.

The real work was designing the system.

The project ended up becoming:

1️⃣ A programmatic video engine

A Remotion-based renderer that converts structured story data into full videos.

Think:

JSON → scenes → animations → video

2️⃣ A branching narrative graph

The story isn’t linear.

Each episode contains decision points that lead to other episodes.

The system guarantees:

• no orphan nodes

• no dead branches

• no broken paths

Basically applying graph design to storytelling.

3️⃣ A real product architecture

While building the story I realized the system was also describing a product:

Student layer

Faculty layer

Admin layer

A full EdTech platform structure emerging from the narrative itself.

4️⃣ A multi-repo ecosystem

The story is built from 8 separate repositories.

Each repo represents a stage in the evolution:

• swipe-survey

• question engine

• backend + payments

• Alchemist app

• faculty demo

• content modules

Each repo becomes a chapter in the documentary.

The strange realization

The "production.json" file became something unexpected.

It isn’t just configuration.

It’s a world specification.

It describes:

• scenes

• decisions

• architecture

• visuals

• narrative paths

The renderer simply executes the design.

Why I’m sharing this

What started as an experiment in rethinking form inputs turned into a new storytelling format:

interactive founder documentaries.

Where the audience doesn’t just watch the build…

they navigate it.

Coming soon

Soon I'll start publishing an interactive video series documenting the journey of building ViaDecide.

Not a tutorial.

Not a course on how to make these videos.

But a real build journey — showing how an idea about improving form inputs evolves into a full product, with every decision, pivot, and experiment along the way.

Think of it as a build-in-public documentary, where the audience can follow and influence the path of the story.

If you're building something yourself, I'm curious:

Would you watch a founder journey where the audience helps decide what gets built next?

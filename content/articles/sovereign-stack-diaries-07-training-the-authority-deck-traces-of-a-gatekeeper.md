---
title: "Training the Authority Deck: Traces of a Gatekeeper"
title_hi: "Training the Authority Deck: Traces of a Gatekeeper"
excerpt: "To ground the model"
excerpt_hi: "To ground the model"
category: "article"
icon: "📄"
date: 2026-06-07
readTime: 1
featured: false
---

# Training the Authority Deck: Traces of a Gatekeeper

To ground the model's behavior, Zayvora was trained on a specialized dataset containing 40 canonical seeds. The training vault is split into 20 hardening seeds that define core engineering tasks, and 20 Butterfly Calibration seeds that modify reasoning pathways.

This trace-augmented training teaches the model to reject queries that violate sovereign local-first constraints. For example, if a script attempts to import an external cloud analytics package, the model's weights steer it to generate a local logging fallback instead.

This locks in security protocols at the weight level, rather than relying on brittle system prompts that can be bypassed via prompt injection. The model naturally acts as a gatekeeper for its own codebase, maintaining architectural compliance autonomously.

Built using: LogicHub · Aporaksha · Daxini · Zayvora

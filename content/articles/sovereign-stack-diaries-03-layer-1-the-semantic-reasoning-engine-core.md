---
title: "Layer 1: The Semantic Reasoning Engine Core"
title_hi: "Layer 1: The Semantic तर्क Engine Core"
excerpt: "Large language models are inherently probabilistic, which makes them unreliable for executing math or physics computations directly. To solve this, Zayvora..."
excerpt_hi: "Large language models are inherently probabilistic, which makes them unreliable for executing math or physics computations directly. To solve this, Zayvora..."
category: "article"
icon: "📄"
date: 2026-06-03
readTime: 1
featured: false
---

# Layer 1: The Semantic Reasoning Engine Core

Large language models are inherently probabilistic, which makes them unreliable for executing math or physics computations directly. To solve this, Zayvora separates planning from computation. Layer 1, the Semantic Reasoning Engine, focuses exclusively on intent deconstruction, variable extraction, and planning, and is explicitly forbidden from performing numeric arithmetic.

When a user inputs a query like 'calculate water flow velocity in a 2-inch pipe with 3 bar pressure', Layer 1 identifies the variables: diameter (2 inches), pressure (3 bar), and the target variable (velocity). It maps these variables into a structured JSON schema, converting names to standard terms and mapping the equations required from a local registry.

If any critical parameter is missing, Layer 1 enforces a Mandatory Clarification Rule, halting execution to ask for the missing values instead of guessing. By keeping the LLM focused entirely on parser and mapping logic, we eliminate the primary source of AI hallucinations.

Built using: LogicHub · Aporaksha · Daxini · Zayvora

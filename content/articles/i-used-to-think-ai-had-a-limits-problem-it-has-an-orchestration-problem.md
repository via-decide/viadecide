---
title: "I Used to Think AI Had a Limits Problem. It Has an Orchestration Problem."
title_hi: "I Used to Think एआई Had a Limits Problem. It Has an ऑर्केस्ट्रेशन Problem."
excerpt: "One sprint. Six products shipped."
excerpt_hi: "One sprint. Six products shipped."
category: "article"
icon: "📄"
date: 2026-04-30
readTime: 8
featured: false
---

# I Used to Think AI Had a Limits Problem. It Has an Orchestration Problem.

One sprint. Six products shipped.

But that's not the story.

```

```

Here's the assumption almost everyone makes when their AI workflow breaks:

 *The model is the constraint.* 

Token limits. Context windows. Reasoning ceilings. Hallucination rates. The instinct is to blame the engine.

This assumes two things:

1. The model is doing what we asked it to do

2. When it fails, it's because it reached a capability limit

Both are usually false.

Let me be specific about this sprint's failures because the specifics matter more than the generalities.

Same bug class kept resurfacing in different products. File structure questions. Data validation logic. Error handling patterns. I kept asking Claude the same question 15 different ways across 15 different conversation threads, each one starting cold, each one reconstructing the context from scratch.

The diagnosis I made at first: the model can't retain knowledge across sessions. It's a statelessness problem.

Wrong.

The actual problem: I had no canonical source of truth about what we'd decided and why. Every conversation thread was independently answering the same question because nothing in the system enforced "here is the decision, propagate it everywhere." The model wasn't failing. The orchestration layer was missing.

Three separate tasks across three different repos, each one exceeding budget projections. 4K tokens, then 8K, then 12K. I kept increasing my input context with "let me add more detail so the model understands better."

The diagnosis: context window limits are the bottleneck.

Wrong again.

The actual problem: nothing was routing different task types to different models, and nothing was validating whether the model was actually adding proportional value per token spent. If Task A needed reasoning-heavy synthesis, it should route to Claude. If Task B needed code generation, it should route to Codex. If Task C was deterministic validation, it shouldn't use a model at all — it should run structured validation logic.

I wasn't hitting a model limit. I was running a misrouted task on the wrong tool for the wrong reason.

Built a multi-step prompt cascade:

•  Step 1: Analyze requirement → JSON structure

•  Step 2: Generate solution → code

•  Step 3: Validate output → quality report

By step 3, the output bore no resemblance to the structure defined in step 1. The model was internally consistent but externally incoherent. I assumed the model was forgetting the original constraint.

Not the issue.

The issue: nothing was checking at step 2 whether the generated code matched the schema from step 1. I was allowing the model to drift because I had no validation gate. The model wasn't the problem. The absence of explicit state checking was the problem.

Three different failure modes. Three different misdiagnoses.

One common root cause: I had confused  *model capability*  with  *system reliability.* 

The confusion exists because capability and reliability feel like the same thing when you're working with one-off tasks.

User asks Claude a question. Claude answers well. Feels reliable.

But the moment you try to:

•  Run the same task multiple times with slight variations

•  Chain one task's output into another task's input

•  Track whether the result is actually correct

•  Route different task types to different tools

•  Maintain consistency across repos and execution contexts

...reliability stops being about capability. It becomes about orchestration.

A capable model producing drift-prone outputs is useless. A less capable model producing validated, routed, state-tracked outputs is production-ready. Reliability is not a function of model power. It's a function of orchestration sophistication.

Zayvora is an orchestration layer. But that phrase is too abstract. Let me structure it by the problem it solves.

 *Layer 1: Input Validation (The Gate Problem)* 

Without: Raw input hits the model. Malformed data costs tokens and produces garbage.

With: Input is validated against a schema before it touches the model. If input is malformed, it's rejected or normalized at the boundary. The model only ever sees data in an expected state.

Why: 10% fewer malformed inputs = proportional token savings + quality improvement. More importantly: accountability. The model is no longer responsible for interpreting chaotic input.

 *Layer 2: Routing (The Right Tool Problem)* 

Without: Everything goes to the same model, or you hardcode routing in your prompt.

With: Task type is classified at entry. Reasoning → Claude. Code → Codex. Validation → structured logic (not a model).

Why: Cost structure becomes visible. You see which tasks are overshooting their needed capability. You can optimize each path independently.

 *Layer 3: Output Validation (The Coherence Problem)* 

Without: Output is returned as-is. If it's malformed, it's the user's problem.

With: Output is checked for structure, completeness, format. Failures don't trigger generic retries — they return specific feedback with exact error context.

Why: When a model receives "your output failed validation, here's exactly why: [specific error]," it's not retrying blindly. It's receiving structured information and can correct specifically.

 *Layer 4: State Management (The Coherence-Across-Time Problem)* 

Without: Each model call is independent. Multi-step tasks have no memory of prior steps.

With: Task state is explicit, versioned, and canonical. When step 2 runs, it carries step 1's decisions. Output from step 2 is validated against state from step 1.

Why: This is the difference between multi-step prompts (which fail) and orchestrated pipelines (which work). A pipeline carries context in code, not in the model's memory.

Here's where the argument gets interesting.

If the orchestration layer is doing the actual work — routing, validating, maintaining state, enforcing constraints — then the specific model becomes less important than whether it fits the mounting bracket.

Not immediately. Not completely. But directionally.

Think about this progression:

 *1. When orchestration is weak:*  Model capability is the bottleneck. You absolutely need the best model you can afford.

 *2. When orchestration is strong:*  Model capability matters less than whether the model is appropriate for the routed task type. Haiku is fine for classification. Claude is fine for synthesis. Codex is fine for code.

 *3. When orchestration is sophisticated:*  The model becomes interchangeable within categories. As long as the model handles its assigned task reliably, it doesn't matter much which one.

This is how mature technology stacks evolve. The database engine matters less than the ORM. The CPU matters less than the OS scheduler. The LLM matters less than the orchestration layer that manages LLM execution.

The implication: companies betting everything on being the "best" model are playing a game with a fixed endpoint. At some point, orchestration systems are good enough that model differentiation stops mattering. And once that happens, the value shifts.

The value moves from "which model is best" to "which orchestration system is most useful."

This is the frame I landed on, and I think it holds:

 *Stage 1: Prompting* 

You interact with a model. You are the user. You send prompts, get responses, format them manually. High touch. Low automation.

Cost: Your time.  

Reliability: Whatever the model gives you.  

Scaling: One person, one workflow.

 *Stage 2: Orchestrating* 

You build a system that directs multiple models. You define which model handles which task. You add routing logic. You add some validation. You manage state across tasks in a single workflow.

Cost: Engineering time to build the orchestrator.  

Reliability: What the models output, plus what your validation catches.  

Scaling: Multiple parallel workflows.

 *Stage 3: Controlling* 

You own the full execution pipeline. Input validation. Routing. Output validation. State management. Failure recovery. You've reduced AI to a component in a larger system that operates by rules.

Cost: Upfront engineering to build the control layer.  

Reliability: High. The control layer guarantees constraints even if a model drifts.  

Scaling: Arbitrary complexity. The system doesn't break, it adapts.

Most AI products right now are stuck at stage 1. Some have moved to stage 2. Almost none are at stage 3, which is why most AI products break the moment they encounter unusual inputs or multi-step workflows.

Zayvora is the attempt to reach stage 3 for everything that touches multiple models or multiple outputs.

I want to be honest about what isn't resolved.

 *Cross-session state isn't fully solved.*  Zayvora manages state within a session cleanly. Between sessions — between days, between weeks — it still depends on external SOPs and retrieval systems.

 *Token economics aren't optimized.*  Running four validation tiers on every output is expensive. The next iteration caches validation results, so stable outputs don't re-validate.

 *The six products aren't equally mature.*  Some have full pipeline coverage. Some are still wired manually.

These aren't failures of the orchestration concept. They're open problems. They're what the next sprint should tackle.

Here's the uncomfortable implication.

If orchestration is the actual value layer — and if orchestration can be systematized into pipelines like Zayvora — then the model itself becomes increasingly interchangeable.

Not immediately. Not completely. But directionally.

The model is the engine. Zayvora is the vehicle. Users don't interact with the engine; they interact with the vehicle. As the vehicle gets more sophisticated, the specific engine matters less than whether it fits the mounting bracket.

This is how every mature technology stack evolves. The database engine matters less than the ORM. The CPU matters less than the OS. The LLM will matter less than the orchestration layer above it.

Cloud AI won't be something you "use" anymore. It'll be something systems like Zayvora quietly replace — or more precisely, something systems like Zayvora make invisible, because the value is no longer in the model interaction but in what's built on top of managed model interaction.

This sprint was one step in that direction. Not a declaration. A trajectory.

I'm not asking you to use Zayvora.

I'm asking you to answer one question: where in your workflow is AI supposed to be working, but you keep cleaning up after it manually?

That gap — between what the model can do and what actually ships reliably — is an orchestration gap. It has a structural fix.

What's yours?

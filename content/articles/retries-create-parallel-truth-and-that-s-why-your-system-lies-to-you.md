---
title: "Retries Create Parallel Truth (And That’s Why Your System Lies to You)"
title_hi: "Retries Create समानांतर Truth (And That’s Why Your सिस्टम Lies to You)"
excerpt: "Most engineers learn retries as a reliability feature."
excerpt_hi: "Most engineers learn retries as a reliability सुविधा."
category: "article"
icon: "📄"
date: 2026-05-10
readTime: 6
featured: false
---

# Retries Create Parallel Truth (And That’s Why Your System Lies to You)

Most engineers learn retries as a reliability feature.  

In production, retries are a  *truth factory* .

Not because retries are “bad”.  

Because retries multiply  *attempts, and most systems don’t have a clean rule for * *which attempt becomes real*.

If you’ve ever seen:

•  a user charged twice,

•  a webhook applied twice,

•  an email delivered twice,

•  a job executed twice,

•  or an “all green” workflow that still produced wrong state…

You’ve met parallel truth.

This isn’t an “edge case”. It’s the default behaviour of distributed systems:

•  networks partition,

•  workers crash,

•  queues redeliver,

•  callbacks arrive late,

•  and time is not stable.

Retries don’t cause chaos.  

 *Undefined commit rules cause chaos.* 

#### The Wrong Mental Model

The wrong mental model is:  

That hides the core issue: “the same operation” doesn’t exist in production.

Each attempt has a unique runtime context:

•  different worker

•  different memory

•  different cache state

•  different DB transaction boundary

•  different upstream availability

•  sometimes different code (deploy drift)

So a retry isn’t “the same thing again”.  

It’s a new attempt operating on a moving system.

If the system allows multiple attempts to write final state, you get multiple “truths”.

#### The Architecture Problem

Parallel truth comes from one structural mistake:

 *Execution is allowed to directly mint reality.* 

In a stable single-machine program, “completion” implies “correctness”.  

In distributed systems, completion just means “some code ran to the end”.

The core production failure mode is:

•  A side-effect happens twice

•  Or the ledger records multiple final outcomes

•  Or the state machine accepts two terminal states

And once two truths exist, every downstream system becomes a liar:

•  analytics will double-count

•  reconciliation will be manual

•  fraud logic will misfire

•  support will be forced into narrative repair

#### What This Looks Like in Practice (3 concrete examples)

 *Example 1: Payment APIs and idempotency keys*  

Payment providers encourage idempotency keys for a reason: clients retry requests on timeouts, and without a stable key, the provider can’t tell whether it’s a retry or a new request.  

The payment can be processed twice even though the client “only clicked once”.

The lesson: the system needs a stable “intent identity” that survives retries.

 *Example 2: Webhooks are at-least-once by default*  

Most webhook systems are designed to retry deliveries on failure, and deliveries can duplicate. If your webhook handler is not idempotent, you’ll apply the same event twice:

•  “subscription created” becomes two subscriptions

•  “invoice paid” becomes two credit operations

The lesson: delivery semantics are not truth semantics.

 *Example 3: Queue redelivery + worker failover*  

Queues frequently provide at-least-once delivery. That means duplicates are allowed. Workers crash mid-task. Another worker picks it up.  

If the job writes side effects without a commit gate, you’ll see:

•  double emails

•  duplicate exports

•  repeated provisioning

•  doubled ledger entries

The lesson: “job completed” is not the same as “state is correct”.

#### The Uncomfortable Truth

The more you scale, the more retries you have:

•  because failure probability grows with the number of dependencies

•  because partial failure becomes common

•  because non-determinism increases

So the uncomfortable truth is:

	The system will create parallel truth unless you prevent it.

And you can’t prevent it with “good coding”.  

It requires architecture: separation of attempt vs commit.

#### The Actual Fix: Separate Attempt from Commit

The fix is not “never retry”.  

The fix is:  *retries must not be allowed to directly commit truth* .

You need three primitives:

### 1) A stable intent identity

Every operation that matters must have an ID that represents intent, not attempt:

•   intent_id  survives retries

•  every attempt references the same  intent_id 

This is the anchor for idempotency, deduplication, and reconciliation.

### 2) A commit gate (single writer for final state)

Attempts can produce candidate outcomes.  

But only a commit mechanism can finalise the state transition.

That commit gate can be:

•  a DB constraint + transactional upsert

•  a state machine transition table with uniqueness guarantees

•  a ledger rule that refuses a second terminal state

•  a reconciliation engine that enforces canonical merge rules

The mechanism varies. The principle doesn’t.

### 3) Replayable lineage (so you can prove what happened)

Even with commit gates, systems diverge.  

You need the ability to reconstruct causality:

•  which attempt ran first

•  which attempt wrote what

•  which attempt was discarded

•  which attempt was accepted

•  why the commit gate chose one over another

Without lineage, you don’t have observability — you have storytelling.

#### Controlled Failure (the part most teams skip)

Sovereign systems aren’t defined by “no failures”.  

They’re defined by:

•  explicit failure classes

•  recoverability guarantees

•  deterministic divergence handling

In practice, that means designing:

•  “duplicate attempt detected” as a normal state, not an error

•  “late callback” as a handled path with deterministic resolution

•  “partial failure” as a recoverable condition with a replay route

#### A Counterargument (What this framework doesn’t explain)

This framework doesn’t solve:

•  business-level disagreements about what should be true

•  upstream vendor inconsistency when they provide contradictory events

•  human workflows that create non-deterministic inputs (“ops clicked twice”)

What it does solve is narrower and more important:

 *it prevents your own execution layer from inventing multiple truths for the same intent.* 

#### A simple maturity model

•  *Level 0: Hope-based retries*  

  Retry until it works. Pray duplicates don’t happen.

•  *Level 1: Idempotency by convention*  

  “We try not to double-apply.” Some dedupe logic scattered around.

•  *Level 2: Intent IDs + commit gates*  

  Retries are safe because only one terminal state is allowed.

•  *Level 3: Replay + deterministic reconciliation*  

  Divergence is expected and resolved in a predictable way.

Most systems stall at Level 1 because it “works in demos”.  

Level 2 is where production trust begins.

#### What To Do With This (3 roles × 1 action)

 *Learner/Researcher:*  

Pick one failure class (e.g., duplicate webhook) and trace how it becomes double truth in your system. Write it down as a state machine.

 *Builder/Operator:*  

Add an  intent_id  to one critical workflow (payments, provisioning, emails). Enforce one terminal transition in the database.

 *Founder/Lead:*  

Stop asking “did it execute?” Start asking “did we prevent parallel truth?” Invest in commit gates and replay before scaling.

#### What’s Next (honest status)

This pattern is stable. Implementations vary.  

The hard part isn’t understanding it — it’s enforcing it with:

•  schemas

•  fixtures

•  deterministic failure tests

•  replay harnesses

That’s the work.

#### Final Word

Retries are inevitable.  

Parallel truth is optional.  

If your system can’t decide “which attempt becomes real” deterministically, you’ll spend your life fixing “random bugs” that are actually architecture debt.

 [ **#DistributedSystems** ](https://www.linkedin.com/search/results/all/?keywords=%23distributedsystems&origin=HASH_TAG_FROM_FEED)   [ **#BackendEngineering** ](https://www.linkedin.com/search/results/all/?keywords=%23backendengineering&origin=HASH_TAG_FROM_FEED)   [ **#ReliabilityEngineering** ](https://www.linkedin.com/search/results/all/?keywords=%23reliabilityengineering&origin=HASH_TAG_FROM_FEED)   [ **#SystemDesign** ](https://www.linkedin.com/search/results/all/?keywords=%23systemdesign&origin=HASH_TAG_FROM_FEED)   [ **#Idempotency** ](https://www.linkedin.com/search/results/all/?keywords=%23idempotency&origin=HASH_TAG_FROM_FEED)   [ **#Infra** ](https://www.linkedin.com/search/results/all/?keywords=%23infra&origin=HASH_TAG_FROM_FEED)   [ **#Zayvora** ](https://www.linkedin.com/search/results/all/?keywords=%23zayvora&origin=HASH_TAG_FROM_FEED)

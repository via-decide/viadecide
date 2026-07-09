---
title: "One Remotion File. 100 Videos. This Is How Educational Content Should Be Made."
title_hi: "One Remotion File. 100 Videos. This Is How Educational Content Should Be Made."
excerpt: "In January, I shipped one educational video per week."
excerpt_hi: "In January, I shipped one educational video per week."
category: "article"
icon: "📄"
date: 2026-04-25
readTime: 7
featured: false
---

# One Remotion File. 100 Videos. This Is How Educational Content Should Be Made.

In January, I shipped one educational video per week.

Forty hours of work per video — most of it repeated labor I'd already done a hundred times before. Same animations. Same transitions. Same subtitle styling. Same export settings. Different concept on top.

For @vialogic (my educational RPG for JEE and CBSE students), this meant 4 videos a month. My backlog was 200+ concepts. Math wasn't on my side.

So I changed the unit of work.

I stopped making videos one at a time. I built one Remotion file that generates 100 of them.

Now I record voice. The system does everything else.

This is what changed.

#### The Real Problem (It Wasn't What I Thought)

For months I told myself the bottleneck was time. It wasn't. The bottleneck was  *repetition* .

Look at where the 40 hours actually went on a single 8-minute video:

| Task | Hours | Repeated work? |

|---|---|---|

| Scripting | 4 | No (unique each time) |

| Voice recording | 3 | No (unique each time) |

| Animations and motion | 15 |  *Yes (95% same patterns)*  |

| Editing, transitions, music | 10 |  *Yes (100% same template)*  |

| Subtitles, exports, formats | 8 |  *Yes (100% mechanical)*  |

Thirty-three of those forty hours were me re-doing work I'd already designed once.

That's not a labor problem. That's a tooling problem.

#### The Insight: Stop Editing. Start Templating.

A video editor opens 30 timelines to make 30 videos. Every timeline is hand-arranged.

A Remotion file is  *one timeline that accepts data* . You write the structure once. You feed it different scripts. It renders different videos.

That's the whole shift.

 jsx

// One file. Reused for every video.

export const Lesson = ({script, voice, language}) => (

  <Composition>

    <TitleCard text={script.title} />

    <ConceptScene equation={script.equation} narration={voice} />

    <ExampleScene steps={script.steps} narration={voice} />

    <Subtitles track={script.subtitles} lang={language} />

    <Outro brand="vialogic" />

  </Composition>

);

Change  script  and  voice . Get a different video. The animations, timing, fonts, brand bumpers, subtitle styling, export pipeline — all of it stays identical because all of it is code.

I don't edit videos anymore. I feed a template.

#### What I Actually Do Now (Per Video)

Here's the entire human workflow for one video today:

1. *Write the script* (~20 minutes) — markdown with scene tags, bilingual lines.

2. *Record the voice* (~25 minutes) — clean read-through, retakes for stumbles. This is the only "production" step left. If a video needs my face, I record a quick clip on phone or webcam and drop it into a Remotion  <Video />  slot in the template.

3. *Drop both into the template input folder* (~2 minutes).

4. *Render* (overnight, batched, no human time).

5. *Upload to YouTube* (~5 minutes).

 *Total active human time: ~1 hour per video.* 

Compared to 40 hours before, that's the math:

| Metric | Before | After |

|---|---|---|

| Active time per video | 40 hours | ~1 hour |

| Output per month | 4 videos | 30 videos |

| Monthly time invested | 160 hours | ~30 hours |

| Cost (hiring equivalent) | ₹1.5–2 lakh/month | ₹0 |

#### Why The Voice/Face Recording Stays Manual

I tried automated voice early on. It works for some niches. For math education in two languages, it didn't:

•  TTS pacing breaks at equation reads

•  Gujarati pronunciation needs a real voice

•  Students trust a human voice over synthesis

So I kept the human signal exactly where it matters — voice — and automated everything that doesn't carry signal.

Same for face. When a concept needs me on camera (e.g., a hard problem walkthrough), I record a 30-second clip on my phone. Remotion accepts video files like any other input. It composites the clip into a designated slot. I don't edit it. I just drop it in.

The principle:  *Automate what's mechanical. Keep what's human.* 

#### The Build (What It Actually Took)

Three months. Most of it learning Remotion well enough to make the template flexible.

The template is one file with about a dozen sub-components:

•   <TitleCard />  — opening with concept name

•   <EquationScene />  — animated equation typeset

•   <ExampleScene />  — step-by-step problem walkthrough

•   <DiagramScene />  — geometric figures, graphs

•   <Subtitles />  — bilingual track, English + Gujarati

•   <VoiceTrack />  — accepts the recorded narration

•   <FaceClip />  — optional face video slot

•   <Outro />  — brand bumper, CTA

The same template renders a 2-minute concept video and an 8-minute mission walkthrough. Length is just an input.

I'm not going to pretend this was painless. Weeks 1–4 felt slow. But once the template stabilized, the leverage compounded fast.

#### When This Inflection Hits You

You probably need this when:

•  You've shipped 20+ videos manually and noticed you're rebuilding the same intro every time

•  Demand is outpacing your weekly output

•  Hiring an editor would eat more than 25% of your revenue

•  Your content has a stable shape (intro → concept → example → summary)

You probably don't need this when:

•  You're shipping 1–3 videos a month and the format keeps changing

•  Each video is bespoke (interview, documentary, vlog)

•  Your audience is paying for production polish that templates can't match

For predictable educational content at volume, templating wins. Every time.

#### What This Does To Your Economics

Before: I was a creator with a labor ceiling. 4 videos a month, period. Hiring a team would have cost ₹1.5–2 lakh a month — half my revenue.

After: I'm a creator with a content ceiling, not a labor one. The ceiling is now "how many scripts can I write," which is roughly 30 a month part-time.

Hiring a team to produce 30 videos a month would cost ₹4–5 lakh a month at Indian rates. I'm doing it for the cost of a webcam and electricity.

That's not optimization. That's a different business.

#### What This Does To @vialogic

Before the template, students hit locked content constantly. They'd beat a Gujarat Ganitam mission, then wait two weeks for the explanation video. Engagement dropped at every wait.

After the template, every mission ships with its concept video on day one. Genius cards (Brahmagupta, Aryabhata) get short bios. Practice problems get walkthroughs. Bilingual coverage is automatic because the template handles English and Gujarati subtitle tracks from one input.

Students stopped waiting. Retention numbers picked up immediately.

#### The Honest Limitations

Remotion is not magic. Three things stay annoying:

1. *Render time.* A 30-video batch takes 6–10 hours. I run it overnight.

2. *No live preview for complex scenes.* You write code, render, watch, adjust. Faster than editing, but not interactive.

3. *You need to know React.* Or work with someone who does. There's no GUI.

If those three are dealbreakers, this isn't your tool. If they're acceptable trade-offs for 10x output, it is.

#### How To Get Started

If you're an educational creator hitting the manual ceiling:

1. *Audit one video.* Mark every minute as either "unique creative work" or "repeated mechanical work." If repeated work is over 60%, you have a templating problem.

2. *Pick one Remotion tutorial weekend.* Build a 30-second test composition with one input parameter. Render it twice with different inputs.

3. *Decide:* if that 30-second test felt powerful, commit 8–12 weeks to building your template. If it felt fragile, hire an editor instead.

4. *Keep your voice in the loop.* Don't automate the part your audience trusts.

#### The Bigger Pattern

Two things I've now removed from my monthly cost:

•  LLM API costs (replaced with local Zayvora stack)

•  Video production labor (replaced with Remotion template)

Both worked the same way. I noticed a recurring drain. I built one thing. The drain stopped.

That's the founder move. Not "work harder." Not "hire more." Build the thing that makes the drain unnecessary, then forget it exists.

```

```

— Dharam

#Remotion #VideoAutomation #EducationalContent #ContentCreator #ProgrammaticVideo #IndieBuilder #EdTech

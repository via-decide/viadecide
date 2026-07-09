---
title: "I spent 8 hours today doing what most developers avoid. Not building new features."
title_hi: "I spent 8 hours today doing what most विकासकर्ता avoid. Not building new features."
excerpt: "Here"
excerpt_hi: "Here"
category: "article"
icon: "📄"
date: 2026-03-15
readTime: 6
featured: false
---

# I spent 8 hours today doing what most developers avoid. Not building new features.

**Here's everything I found, fixed, and shipped today on the ViaDecide OS project ** 👇

━━━━━━━━━━━━━━━━━━━━━━━━

ViaDecide is a free, browser-first AI tools platform.

No install. No account required for most tools.

The stack: Vanilla JS + HTML + CSS + Supabase via CDN.

No frameworks. No build step. Just the web.

Today's focus: the Eco-Hack Engine — a game economy layer

with login, a plant you grow by studying, and credits earned

by answering quiz questions across 4 games.

━━━━━━━━━━━━━━━━━━━━━━━━

1. SUPABASE_URL = ' [https://example.supabase.co](https://example.supabase.co) '

The login page had a placeholder URL.

&nbsp;&nbsp; Every auth call was hitting a 404.

&nbsp;&nbsp; Login was broken for everyone.

&nbsp;&nbsp; It had been deployed like this.

2. validatePassword() ran on LOGIN too

I built password complexity checks for registration:

&nbsp;&nbsp; 8+ chars, must contain a number.

Then accidentally applied that same check to LOGIN.

Anyone whose password didn't have a number?

Permanently locked out.

The error message said nothing helpful.

3. showDashboard() called 3 times simultaneously

On every page load with a cached session:

&nbsp;&nbsp; → restoreFromLocalFastPath() called it

&nbsp;&nbsp; → checkSession() called it

&nbsp;&nbsp; → onAuthStateChange() called it

Three wallet fetches. Three plant loads.

&nbsp;&nbsp; Action log filled with duplicate entries.

&nbsp;&nbsp; Race conditions on every login.

4. WalletManager showed '125 🌿' always

The wallet display was a stub.

&nbsp;&nbsp; It never made a single database call.

&nbsp;&nbsp; Every user saw 125 drops regardless of their real balance.

5. PlantManager showed '🌿 Level 3' always

Same problem. Hardcoded mock.

No real data. Just a lie rendered on screen.

6. No users table row on register

New users signed up but had no row in the database.

&nbsp;&nbsp; All subsequent DB reads returned null.

&nbsp;&nbsp; The fallback silently showed defaults.

&nbsp;&nbsp; Nobody knew.

7. router.js had duplicate const declarations

  const canonicalRoute declared twice.

&nbsp;&nbsp; const navLinks declared twice.

&nbsp;&nbsp; const sections declared twice.

&nbsp;&nbsp; SyntaxError at parse time.

&nbsp;&nbsp; The ENTIRE homepage navigation never initialised.

&nbsp;&nbsp; Tool cards didn't render.

&nbsp;&nbsp; Nav links did nothing.

8. tool-registry.js had orphaned object literals

&nbsp;&nbsp; Two tool objects floating outside any array.

&nbsp;&nbsp; Another SyntaxError.

&nbsp;&nbsp; The registry failed silently.

&nbsp;&nbsp; All dynamic tool cards on the homepage: invisible.

━━━━━━━━━━━━━━━━━━━━━━━━

Every game in the repo was an island.

HexWars — only loads vd-nav-fix.js

SkillHex — loads nothing shared

Snake Game — loads nothing shared

Growth Milestone Engine — loads nothing shared

Meanwhile the shared/ folder had:

→ EngineBalance.js — balance analysis for game economies

→ EngineModels.js — player scoring models

→ SimulationUtils.js — synthetic player simulation

→ ToolBridge.js — cross-page messaging

→ ToolIntelligenceEngine.js — tool relationship analysis

→ AgentRuntime.js — sequential workflow execution

→ WorkflowEngine.js — agent step management

All of it. Sitting there. Not wired to anything.

Tokens earned in HexWars?

Evaporated on restart.

Score in SkillHex?

Saved to its own isolated localStorage key nobody read.

Snake high score?

In a key called 'snake-best'. Disconnected from everything.

━━━━━━━━━━━━━━━━━━━━━━━━

AUTH:

→ Real Supabase URL and credentials

→ Login validation no longer checks password complexity

→ _dashboardShown flag prevents triple-trigger race condition

→ WalletManager now reads from Supabase with localStorage fallback

→ PlantManager now reads real plant level and hydration

→ ensureUserRow() upserts DB row on first login so nobody is orphaned

→ Welcome bonus: +25 Focus Drops and +5 Lumina on registration

ROUTER + REGISTRY:

→ Removed duplicate const declarations from router.js

→ Moved orphaned objects back inside BUILTIN_TOOLS array

→ Homepage nav now works

→ Tool cards now render

GAME ECONOMY:

→ Created shared/vd-wallet.js — one localStorage contract all games write to

→ HexWars now saves tokens and score on game end via VDWallet

→ SkillHex syncs delta XP to shared wallet on every decision

→ Snake coins increment per food eaten

→ Wings of Fire Quiz awards stars and drops per correct answer

→ All games send session data to eco-engine via ToolBridge

→ Eco-engine listens for incoming credits and adds them to Supabase

DATABASE:

→ Wrote the full Supabase schema from scratch

→ public.users with focus_drops, lumina, plant_level, plant_hydration

→  [public.game](http://public.game) _scores — every session of every game logged

→ handle_new_user() trigger — auto-creates user row on signup

→ increment_wallet() RPC — atomic credit updates, no race conditions

→ save_game_score() RPC — saves score AND updates wallet in one transaction

→ personal_bests view, leaderboard view, indexes

━━━━━━━━━━━━━━━━━━━━━━━━

ToolBridge is a localStorage-based event bus.

When you finish a HexWars game, it does this:

ToolBridge.sendContext('hex-wars', 'eco-engine-test', {

&nbsp; &nbsp; game: 'hexwars',

&nbsp; &nbsp; score: 450,

&nbsp; &nbsp; tokens: 75,

&nbsp; &nbsp; dropsEarned: 45,

&nbsp; &nbsp; luminaEarned: 2

&nbsp; })

That writes to localStorage key:

&nbsp;  [viadecide.toolbridge.incoming.eco](http://viadecide.toolbridge.incoming.eco) -engine-test

When the user opens the eco-engine login page,

it reads that key on load.

No server. No WebSocket. No push notifications.

Just localStorage as a message queue between pages.

It's not perfect. But it works.

And it's entirely offline-capable.

━━━━━━━━━━━━━━━━━━━━━━━━

This is the part I'm most excited about.

It's a physics-based quiz card engine.

Cards render in a 3D stack.

You answer by swiping — UP, LEFT, RIGHT, DOWN.

The cards respond to device gyroscope on mobile.

Tilt your phone to steer the card.

Every question bank is now tied to your subject selection.

Select Science → Chemistry → you get electrochemistry questions.

Select Programming → Frontend → you get CSS and JavaScript questions.

Select UPSC → Prelims → you get constitutional law questions.

120 questions across 24 subject combinations.

All written by hand.

All wired to the same swipe mechanic.

The cards earn you Focus Drops.

Focus Drops water your plant.

Your plant evolves through 10 stages.

Stage evolution earns Lumina.

Lumina unlocks Circle tier in the clan system.

One mechanic. Five layers deep.

━━━━━━━━━━━━━━━━━━━━━━━━

The plant is not a gimmick.

It's a forcing function for daily habits.

Every question you answer today waters your plant.

Miss a day and it loses 1% hydration per hour.

Let it die and you restart at Level 1.

It's designed to cost you something if you stop.

Not money. Just the progress you built.

The best habit apps don't reward you for doing the thing.

They make it feel like loss when you don't.

━━━━━━━━━━━━━━━━━━━━━━━━

Files audited: 47

Bugs found: 9 critical, 6 high, 4 medium

Shared modules wired: 8

Games connected to shared economy: 4

SQL tables created: 2

SQL functions written: 3

Lines of code changed: ~800

Cups of chai: too many

━━━━━━━━━━━━━━━━━━━━━━━━

I shipped broken code to production.

The login page showed a placeholder URL.

The wallet showed fake numbers.

The router crashed on load.

And I didn't know.

Because I was building fast and testing locally

with data already in localStorage.

The lesson: test on a fresh browser profile.

Every deploy. No exceptions.

Your  [localhost](http://localhost)  is lying to you.

━━━━━━━━━━━━━━━━━━━━━━━━

 [https://via-decide.github.io/decide.engine-tools/](https://via-decide.github.io/decide.engine-tools/) 

All tools are free.

No login required for 44 tools.

Login only for the game economy layer.

If you want to try the Kinetic Simulator,

pick any subject in the StudyOS setup

and go to the Alchemist Engine tab.

Swipe the cards.

Earn the drops.

Grow the plant.

━━━━━━━━━━━━━━━━━━━━━━━━

What's the most embarrassing bug you've ever shipped to production?

Drop it below. 

I'll start: mine had a hardcoded '125 🌿' as a wallet balance for three weeks before anyone noticed.

━━━━━━━━━━━━━━━━━━━━━━━━

#BuildInPublic #GameDev #JavaScript #WebDevelopment #Supabase

#VanillaJS #IndieHacker #OpenSource #StudyOS #ViaDecide

#NoCode #LowCode #HabitBuilding #EdTech #SoloFounder

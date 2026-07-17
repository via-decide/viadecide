---
title: "Why We Stopped Using Auth Libraries And what we learned about trust when you build something yourself"
title_hi: "Why We Stopped Using Auth Libraries And what we learned about trust when you build something yourself"
excerpt: "There is a moment every developer recognizes."
excerpt_hi: "There is a moment every developer recognizes."
category: "article"
icon: "📄"
date: 2026-07-17
readTime: 7
featured: false
---

# Why We Stopped Using Auth Libraries And what we learned about trust when you build something yourself

There is a moment every developer recognizes.

You need login functionality. You open a browser, search for the recommended library, add it to your project, and spend the next two hours reading documentation about configuration options you do not fully understand.

You ship it. It works. You move on.

No one questions it. No one reads the source. No one asks what the library is actually doing — or why.

### The Moment We Started Asking Questions

We were building an authentication system that needed to work across multiple apps — different domains, different purposes, but a shared identity layer underneath.

The obvious path was an existing solution. Something pre-built, battle-tested, popular on npm.

But when we sat down to evaluate options, something felt off. Every library came with opinions we had not agreed to. Configuration structures that assumed a certain kind of application. Dependency trees that pulled in packages we would never audit. Abstractions that made the simple parts easier — but made the confusing parts completely opaque.

The honest answer, every time, was: not that much.

A JWT is a base64-encoded header, a base64-encoded payload, and an HMAC signature. That is it. There is no magic. The entire mechanism fits in your head in about ten minutes.

### What "Building It Yourself" Actually Means

Let us be clear about what this is not.

This is not a recommendation to reinvent cryptography. Cryptographic primitives — hashing, signing, random number generation — belong to your platform's standard library, full stop. Node's ⁠ crypto ⁠ module exists precisely so you do not roll your own.

What we are talking about is the layer above that. The logic that says: take a user ID, wrap it in a structured payload, sign it with a secret, and return a token. Then later: take that token, verify the signature, check the expiry, and trust the payload.

That logic is about fifty lines of code. We wrote it. We read it. We own it completely.

### What Changed When We Read Every Line

The most surprising thing about building your own auth layer is not the technical insight. It is the psychological shift.

When something goes wrong in a third-party library, you debug a black box. You search GitHub issues from three years ago. You find a Stack Overflow thread that sort of matches your situation. You apply a fix you do not entirely understand and hope it holds.

The debugging experience is completely different. Not because our code is better — sometimes it is worse. But because the surface area is visible. There is no hidden behaviour. No undocumented edge case buried inside a dependency you never looked at.

That visibility changes how you make decisions. You stop treating authentication as a solved problem that lives outside your codebase. You start treating it as a part of your system that you are responsible for — and that responsibility sharpens how you think about it.

### The Dependency Question Nobody Asks

Every dependency you add is a decision. Most teams make that decision without realising it.

A library gets added to solve a specific problem. Then the library gets updated. Then the update has a breaking change. Then you spend a day updating your code to match someone else's new API design. Then the library gets deprecated. Then you migrate to a new one and the cycle starts again.

This is normal. It is accepted. It is also a significant amount of time spent managing things you did not build, maintaining things you did not choose, and debugging things you do not understand.

We are not saying remove all dependencies. That would be absurd.

But auth is a good place to ask the question honestly: do we actually need this library, or are we using it because nobody ever stopped to ask?

### What Simple Actually Looks Like

Here is the shape of what we built, without getting into specifics.

A single file handles token generation. It takes a payload — user ID, username, whatever belongs in the token — and returns a signed string. The signing uses HMAC-SHA256 from the standard library. The expiry is a unix timestamp. The structure follows the JWT spec because that spec is sensible, not because a library forced us to.

A second file handles verification. It splits the token, checks the signature, validates the issuer and audience fields, and confirms the expiry. If anything fails, it throws. If everything passes, it returns the payload.

Two middleware functions sit on top of that. One for regular auth. One for a more specific identity layer we call Passport tokens, which carry additional fields like entitlements and audience claims.

The frontend side is equally direct. A JavaScript module stores the token in localStorage, exposes ⁠ login ⁠, ⁠ logout ⁠, and ⁠ isAuthenticated ⁠ as functions, and on page load, either shows the app or shows the login form. No framework. No state management library. Just logic that is easy to follow.

### The Part About Trust

There is a version of this conversation that turns into a debate about security.

"Rolling your own auth is dangerous." That phrase gets repeated a lot, and it contains a real warning — one worth taking seriously.

Cryptography is dangerous to roll yourself. Token storage has tradeoffs. Password hashing needs careful thought. These are real concerns and they apply to everyone, including people using libraries.

But here is what often goes unsaid: libraries do not make you secure by default. They give you tools and make certain mistakes harder. They do not prevent you from misconfiguring them, using them incorrectly, or failing to understand what they protect and what they do not.

Security comes from understanding what you are building. Libraries can support that understanding, or they can hide it.

When we read the code ourselves — when we understand what the signature check does and why, what the expiry field protects against and when it fails — we make better decisions. Not because we are smarter than the library authors. Because we understand our own system.

### What This Taught Us About Building in General

Authentication is not special in this regard.

The same pattern appears everywhere. A problem exists. A library exists. The library gets added. The understanding never arrives.

The problem with this approach is not that libraries are bad. It is that they can become a way of deferring understanding indefinitely. You ship features. Things work. You never learn what is underneath.

At some point that debt comes due — usually at the worst possible moment, when something breaks and no one on the team can explain why.

We have started asking a simpler question before reaching for a dependency: is this something we should understand? If the answer is yes, we build it. Not because building is always better, but because the act of building is how understanding happens.

### The Takeaway

You do not need to rewrite your auth stack this week. That is not the point.

The point is that some things in your codebase deserve to be understood, not just used. Authentication is one of them. The logic that decides whether a user is who they say they are, and what they are allowed to do — that logic should not live in a black box.

Read the library you are using. All of it, or at least the parts that matter. If reading it makes you confident, great. If reading it makes you uncomfortable, that discomfort is information.

```

```

```

```

```

```

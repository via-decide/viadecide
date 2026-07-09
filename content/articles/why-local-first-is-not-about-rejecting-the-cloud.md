---
title: "Why Local-First Is Not About Rejecting The Cloud"
title_hi: "Why स्थानीय-प्रथम Is Not About Rejecting The क्लाउड"
excerpt: "A Conversation About Infrastructure, Control, and What Happens When You Build Your Own"
excerpt_hi: "A Conversation About बुनियादी ढांचा, Control, and What Happens When You Build Your Own"
category: "article"
icon: "📄"
date: 2026-04-15
readTime: 11
featured: false
---

# Why Local-First Is Not About Rejecting The Cloud

## A Conversation About Infrastructure, Control, and What Happens When You Build Your Own

I spent three hours last week explaining what "local-first" actually means to someone building a startup in Bangalore. They kept waiting for me to say it: "and that's why you should never use AWS." I never said that.

By the end of the conversation, they understood. But it took longer than it should have, because the framing is wrong. Everyone assumes local-first is a position in a war—cloud versus no-cloud, AWS versus self-hosted, scalable versus amateur. It's not. It's something else entirely.

Local-first isn't a rejection of cloud infrastructure. It's a question about  *whose*  infrastructure you're handing your problem to, and what happens when the answer changes.

## How We Ended Up Cloud-First By Default

To understand this, we have to go back fifteen years.

Around 2009, Heroku solved a problem that had plagued developers for a decade: deployment was hard. You had to manage servers. You had to understand system administration. You had to own the relationship with your infrastructure. For a developer who just wanted to ship code, this was friction.

Heroku said: forget about servers. We'll handle that. You write Ruby. We handle the rest. Push your code. Get a URL. Move on.

This was genuinely revolutionary. Not because servers were bad—they weren't. But because the convenience was so immediate that it changed how everyone thought about building software.

AWS followed with a different model: we'll give you all the tools, but you manage the orchestration. Lambda, RDS, S3, CloudFront. You can build almost anything. And then Google and Azure and a dozen others built similar platforms. The cloud era wasn't a conspiracy. It was a solved problem. Someone found an elegant solution to a real problem, and the entire industry adopted it because it worked.

But here's what happened in that adoption: we stopped asking whether we  *needed*  the cloud. We started asking whether we could afford  *not*  to use it. The question inverted.

The convenience was real. The cost was less visible.

When you upload your code to someone else's infrastructure, you're inside their operational envelope now. Your terms of service can change—and they do, regularly, with months of notice if you're lucky. Your pricing can change. AWS has a history of this: Lambda pricing went up in 2020, went down in 2021, went up again in 2024. If you've built a business on Lambda's pricing model, you're now dependent on their business decisions.

Your data residency is decided by someone in a boardroom in Mountain View or Dublin or Singapore. Your data compliance—whether it meets GDPR, whether it meets local Indian data residency laws—is now dependent on AWS's commitment to those regulations. If they decide to exit a region, you exit with them.

Your security posture is dependent on whether AWS's security is good enough, whether their team is competent, whether they're incentivized to protect  *your*  data the same way you would. (Spoiler: they're not. They're incentivized to protect their reputation. It's not the same thing.)

And here's the one nobody talks about: you're dependent on them staying in business. Amazon is not going bankrupt tomorrow. But Heroku was sold to Salesforce. Salesforce shut down Heroku's free tier. Heroku is now a legacy service that everyone is quietly migrating away from. This isn't malice. It's just how companies work. They acquire services, they consolidate them, they deprecate them, they eventually retire them. And if you built your entire product on that service, you have to migrate. Or you have to die with it.

This isn't a conspiracy story. It's just how systems work.

## What Local-First Actually Means

Local-first means: can this system function entirely on your hardware, under your control, with no external dependencies at runtime?

Not because you hate the cloud. But because having that option changes how you think about architecture.

It's a question, not a statement. It's not saying "cloud is bad." It's saying "let's understand what happens if the cloud wasn't an option."

When you build with cloud-first thinking, you assume certain things: you assume bandwidth is cheap. You assume latency is acceptable. You assume the remote service will always be available. You assume you can scale horizontally by adding more instances. You assume you can store arbitrary amounts of data without cost implications.

These assumptions work. They work really well. But they're assumptions.

When you build with local-first thinking, you stop assuming. You ask: what if bandwidth was expensive? What if latency mattered? What if this service had to work offline? What if I had to store this data on a device with 4GB of RAM?

Here's what I noticed: when you have to make something work without a server, you make different design decisions. Better design decisions, often.

You compress data more aggressively. Instead of sending raw JSON across the wire, you think about what actually needs to be transmitted. You start asking: can I serialize this more efficiently? Do I really need all these fields? Can I precompute some of this on the client so I don't have to send raw data back and forth?

You think harder about what actually needs to be computed versus what can be precomputed. In a cloud-first system, you defer everything to the server because servers are cheap and plentiful. In a local-first system, you precompute on the client because the client is the only thing you have. Paradoxically, this often makes things faster, not slower. Because network latency is usually the bottleneck, not CPU.

You design for offline-first, which ironically makes the online experience faster. You don't wait for a network roundtrip to know if something is valid. You validate locally. You don't wait for the server to confirm you've saved something. You save locally, and sync later. This means the user experience is snappier, more responsive, more alive. The online part just becomes the sync layer.

You audit your own data flow because you can't blame a third party for a breach. If the data is on your hardware, you understand exactly how it got there, where it's stored, how it's encrypted, who can access it. You can't hand-wave responsibility to "AWS handles security." You own the security.

## The ViaDecide Question

ViaDecide's entire stack is built this way. Not because I'm anti-cloud. But because I wanted to know: what does infrastructure look like when the person building it is the same person who has to maintain it?

It turns out, it looks simpler. Faster. More legible.

ViaDecide runs on GitHub Pages and Cloudflare Pages. Zero backend. The entire application is static HTML, vanilla JavaScript, and client-side state management. Forms go to FormSubmit, a third-party service, but I could move that in an hour if I needed to. Data is stored in localStorage and IndexedDB on the client. There's no database. There's no server. There's no AWS account.

The first question people ask: how do you scale this? The answer is: I don't need to. The application scales because it's static files. GitHub Pages serves it globally. Cloudflare caches it. A million people can use it simultaneously, and the cost is zero. Not $100 per month. Not $10,000 per month when you get traffic. Zero.

The second question: what about realtime collaboration? What about user accounts? What about persistence?

The answer is: those are features, not requirements. Do you  *need*  realtime collaboration, or does it just feel nice? Do you  *need*  user accounts, or are you building them because that's what SaaS applications do? Do you  *need*  persistence in a database, or would localStorage work if you designed the system around it?

For LogicHub—our visual node-to-APK builder—the entire system is client-side. You build your logic locally. The nodes, the edges, the connections are all in your browser's localStorage. You hit export, and the system compiles your graph into an APK right there, on your machine. No server. No build pipeline. No waiting for a CI/CD system to finish. You get your APK in seconds, locally generated.

Is it as powerful as Xcode or Android Studio? No. Does it need to be? Also no. It solves a specific problem—turning visual logic into mobile apps—and it solves it entirely locally. You own the output. You own the data. You own the code.

## The Scaling Paradox

Here's the irony: local-first systems are often  *better*  at scaling to the cloud than systems that started cloud-first.

When you understand your actual dependencies, when you've forced yourself to make every component independently testable, when your system doesn't assume infinite bandwidth or millisecond latency—that's when cloud deployment becomes an optimization, not a necessity.

A lot of startups go in the reverse direction. They start with Heroku. They're successful. They hit scale. They move to Kubernetes. They spend six months configuring infrastructure. They hire a DevOps engineer. The system becomes more complex, not less. Because cloud infrastructure compounds complexity if you don't understand your actual constraints.

Local-first forces you to understand constraints first. Then, if you decide you need cloud, you add it on top of a system that already works, already scales, already knows its limits.

This is why the Daxini Stack—which is entirely local-first, running quantized Llama on any 8GB machine—is actually more deployable to cloud than most "cloud-native" applications. Because it doesn't assume cloud. It runs anywhere. Which means it can run on AWS, on a corporate server, on a device with no internet, on someone's laptop. The cloud becomes optional. A deployment target, not a requirement.

## Sovereignty, Control, and Understanding Your Levers

Sovereignty isn't about rejecting tools. It's about understanding your levers before you pull them.

When you use AWS, you have a lot of power. You can spin up infrastructure in seconds. You can scale globally. You can use managed services for databases, queues, compute, storage. This power is real and seductive.

But it comes with a cost: you don't own the levers. Amazon does. You're operating inside their system. You've optimized for their constraints, their pricing, their availability zones, their API design. If they change the API, you adapt. If they change pricing, you adapt. If they deprecate a service, you migrate.

Local-first is the opposite. You own the levers. You understand them. You can change them. If you want to move from one cloud provider to another, you can, because your system doesn't assume cloud. If you want to move from cloud back to on-premises, you can. If you want to change your data format, you change it. It's all your code, all your data, all your infrastructure.

This ownership is what sovereignty means. Not being anti-technology. Being pro-understanding.

## The Real Question

The person in Bangalore was building a marketplace app. They asked: should we use AWS or should we do local-first?

The question is wrong. The question should be: what are the actual constraints we're optimizing for?

If you're optimizing for time-to-market and you have budget, AWS is faster. You don't have to think about infrastructure. You focus on product.

If you're optimizing for long-term ownership and you have time, local-first is faster. You don't have to maintain infrastructure. You focus on product, and the product is simpler because you've eliminated the complexity of cloud operations.

If you're optimizing for cost and you have technical depth, local-first is cheaper. No AWS bill. No DevOps overhead.

If you're optimizing for scale and you have capital, cloud is better. You can throw money at the problem.

But here's what I told the person in Bangalore: the reason to think about local-first isn't to use it exclusively. It's to understand what your system needs to do without it. Because that understanding changes everything about how you architect.

## What I Built, Why I Built It That Way

ViaDecide exists because I asked: what if I built an entire digital ecosystem without servers?

The answer: it's possible. And it's simpler.

Not because servers are bad. But because asking the question forced me to design better. Simpler. More portable. More understandable.

This is the actual insight. Not "don't use the cloud." But "understand what your system looks like without the cloud, because that understanding makes you a better builder."

## The Permission You're Missing

Most teams don't ask this question because they don't have permission to. They're inside a company. They're following the playbook. The playbook says: use AWS. Use microservices. Use Kubernetes. Optimize for scale.

The permission I have—which is constrained resources, zero funding, one person building—changed everything. It forced me to ask: what if I didn't have money for servers? What would I build?

And the answer was: something simpler, more legible, more honest about what it's actually doing.

This is available to you too. Not because you need to build without funding. But because the question changes how you think.

## What's One Thing?

Here's what I want to leave you with: what's one thing in your stack you could move off someone else's infrastructure this month?

Not everything. Not your entire system. Not if it would break your product or cost you revenue.

Just one thing.

One service you could replicate locally. One feature you could implement without a third-party API. One data store you could move from the cloud to your own hardware.

Just to see what happens. Just to understand what that's like.

Because sovereignty isn't an all-or-nothing choice. It's a spectrum. And moving one thing from "someone else's infrastructure" to "your control" changes how you think about the other things.

It teaches you that you have options.

And having options changes everything.

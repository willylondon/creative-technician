---
title: "What We Actually Fixed in Our Blog Automation Stack Today"
date: 2026-04-22
slug: what-we-actually-fixed-in-our-blog-automation-stack-today
layout: post
---

# What We Actually Fixed in Our Blog Automation Stack Today

> A real look at the engineering work behind hardening our SEO Content Factory and Daily Blog Publisher so they publish more reliably and stop stepping on each other.

![Laptop displaying code on a desk](/assets/images/creative-technician-workflow-hardening-unsplash.jpg)

There is a version of automation work that looks glamorous from the outside.

The AI writes.
The workflow runs.
The blog appears.
The tweet goes out.

And then there is the real version.

The real version is where one workflow quietly dies because a file already exists. Another one "passes" but sends no Telegram message because the branch wiring is wrong. A trend feed looks smart on paper but returns stale data. A tweet fails because the content already went out once. A brand-specific site accidentally mentions another business because the prompt was too loose.

Today was not about building a shiny new automation. It was about turning a fragile publishing machine into something much closer to a real content system.

---

## The two workflows at the center of it

The stack we worked on has two different jobs.

The first is the **SEO Content Factory**, which handles Friday publishing for **Master Bryan Kukibo**.

The second is the **Daily Blog Publisher**, which rotates through the weekday publishing load for the other brands, including **The Creative Technician**.

On paper, that sounds simple:

1. choose a topic  
2. generate the post  
3. commit it to GitHub  
4. tweet it  
5. send a Telegram notification  

In practice, those five bullets hide the messy part: retries, duplicate protection, brand boundaries, stale inputs, branch wiring, credentials, and notification logic.

That messy part is what we spent today fixing.

## The first win: Daily Blog Publisher is no longer a silent failure machine

One of the biggest problems was that the Daily Blog Publisher had been failing in ways that were easy to miss.

The most obvious bug was a syntax problem in the trend analysis code. One literal escaped newline in the wrong place was enough to stop the workflow before it could generate anything. That got fixed. But honestly, that bug was just the first loose thread.

Once we pulled on it, we found the larger reliability issues:

- same-day reruns could keep moving forward when they should have stopped
- duplicate tweet attempts could throw 403 errors
- Telegram success notifications could be wired in a way that looked green in n8n but still sent nothing
- stale trend data made the workflow look dynamic while actually falling back to the same safe topics

That meant the system was producing the illusion of automation without the reliability of it.

So the goal today was not just "make it run once." The goal was to make the workflow behave sensibly when real-world messiness showed up.

## We tightened the control flow instead of pretending retries do not happen

One of the most useful changes was the skip logic.

If a site had effectively already posted for the day, the workflow needed to stop early instead of burning tokens, rewriting the same content, and committing another version of the same post. That sounds obvious, but in automation systems the difference between "logic exists" and "logic is wired correctly" is everything.

The fix was small but important:

- detect when a same-day post condition already exists
- route the true skip branch to stop
- let only the false branch continue into analysis and generation

That one change protects API spend, repository history, and operator trust. If you rerun a workflow because you are checking something, it should not casually create extra commits just because the IF node was connected backward.

## We stopped treating publishing and tweeting as the same event

This was another important correction.

A blog post publishing successfully and a tweet publishing successfully are related, but they are not the same success condition.

That distinction matters because duplicate tweet errors are normal on reruns. X will block repeated content. The wrong way to design around that is to let the tweet failure make the whole run look broken. The better way is:

- publish the post
- determine whether it is actually a new post
- only tweet when it makes sense
- still notify Telegram cleanly either way

That is the behavior we pushed toward today.

The workflow now has a clearer idea of what counts as:

- a real new publish
- an update or rerun
- a skipped tweet
- a tweet error that should be reported without taking down the whole publishing path

That kind of separation is what makes a workflow operational instead of theatrical.

## We built stronger topic flow instead of trusting stale trend inputs

Another big shift was topic handling.

Originally, there was too much dependence on trend data that was not consistently useful. Even when the workflow ran, the "smart" trend matching could still collapse into fallback behavior because the input sheet was stale or noisy.

So today moved the system toward a better middle ground:

- a **Blog Topic Queue** for cleaner candidate topics
- support for backfilled rows when needed
- queue consumption tracking so used topics do not stay in rotation forever
- graceful fallback when live trend inputs are unavailable

This matters because reliable automation is not just about execution. It is about input quality.

If the topic source is bad, the rest of the workflow can still be technically healthy while producing repetitive or low-signal content. A queue-based approach makes the system easier to inspect, easier to debug, and easier to improve over time.

## We added stronger brand isolation because automation should not blur identities

This was one of the most important non-technical fixes, even though it was implemented technically.

A Bryan post mentioning Source Arena had no business being published. That kind of leak breaks trust immediately because it makes the content feel stitched together instead of intentional.

So we tightened the publishing rules across the workflows:

- prompts now explicitly forbid references to the other managed brands
- contact details, domains, addresses, and calls to action are no longer allowed to bleed across sites
- a **Brand Safety Guard** can block content before publish if another site's markers show up

That matters because multi-site automation only works if each site still feels like itself.

The only intentionally shared element left in the system is the affiliate tagging setup. Everything else now has stricter boundaries.

## We improved visibility with logging instead of relying on memory

A workflow history inside n8n is useful, but it is not the same as having publishing logs you can actually work with.

That is why we added cleaner tracking:

- a **Published Posts Log**
- a **Social Log**

The value there is simple.

When something publishes, you want a durable record of:

- date
- site
- topic
- path
- URL
- commit reference
- tweet outcome

That makes audits easier. It makes troubleshooting easier. It also makes future automation decisions easier because you are no longer guessing what happened last week.

Good automation is not just "did it run?" Good automation is "can I prove what it did?"

## We pushed media handling in a more mature direction too

The newest quality-of-life improvement was image handling for Creative Technician posts.

Instead of leaving imagery as an afterthought, the system now supports an Unsplash-powered featured image step. For this post, I used a real Unsplash image and stored it locally in the site assets so the post can render cleanly on the live site and in the newer Next-based content setup.

Just as important, the Unsplash access key was moved out of the workflow JSON and into a proper n8n credential instead of being left inline where it did not belong.

That is the kind of behind-the-scenes improvement nobody celebrates loudly, but it is exactly what makes a system safer to keep running.

## What today really accomplished

If I had to summarize the day honestly, I would not say we "built an AI content machine."

I would say we did the less flashy and more valuable work:

- we reduced silent failure paths
- we tightened branch logic
- we separated publish success from tweet success
- we protected brand identity
- we improved topic hygiene
- we added better logging
- we moved one more secret into the right place

That is what real automation work often looks like after the demo phase.

Not magic.  
Maintenance.  
Not hype.  
Hardening.

And if you care about systems that keep working after the first exciting run, that is the work that matters most.

Photo by [Dawit](https://unsplash.com/@oneminch) on [Unsplash](https://unsplash.com/photos/laptop-displaying-code-on-a-desk-dTmj5aXbKp4).

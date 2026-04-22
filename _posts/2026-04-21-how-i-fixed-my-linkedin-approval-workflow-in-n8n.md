---
layout: post
title: "How I Fixed My LinkedIn Approval Workflow in n8n"
date: 2026-04-21
categories: [Automation, n8n, LinkedIn]
excerpt: "A practical breakdown of how I audited and stabilized my n8n LinkedIn posting system, from Google Sheets state bugs to reply-based approvals and a new Telegram bot."
author: "Willy London"
image: /assets/images/linkedin-social-unsplash.jpg
image_width: 3000
image_height: 2000
---

I spent today tightening a LinkedIn posting workflow that looked finished on the surface, but still had a few state-management traps underneath.

The system already had the right shape:

- one workflow to fetch the latest blog post, draft a LinkedIn version, log it to Google Sheets, and ask for approval in Telegram
- another workflow to listen for approval commands, post to LinkedIn, and mark the row as complete

That sounds simple. In practice, the messy part is never the happy path. The messy part is what happens when LinkedIn succeeds, Google Sheets fails, Telegram sends a weird payload, or a filename is missing at exactly the wrong moment.

That is the work we cleaned up today.

## The Two-Workflow Setup

The first workflow is the content-prep side.

It runs on a schedule, reads the latest markdown post from my GitHub Jekyll repo, parses the front matter, sends the article body to OpenRouter for a LinkedIn rewrite, appends the result to a Google Sheet as `pending`, and sends me the draft in Telegram.

The second workflow is the control plane.

It listens for Telegram messages, finds the matching pending row in Google Sheets, posts the approved draft to LinkedIn through a custom HTTP Request node, updates the spreadsheet status, and sends a confirmation back to Telegram.

Architecturally, that split is still the right one. Content generation and approval are different jobs. They should stay separate. But the details inside them needed work.

## The First Problem Was Not the Crash

The obvious symptom was a crash that happened right before the Google Sheets update block, which left one row stuck at `pending` even though the LinkedIn post had already gone live.

That was annoying, but it was not the real issue.

The deeper problem was that the workflow could lose track of state.

During the audit I found a live mismatch between `filename` and `Filename`. One part of the fetch workflow wrote lowercase `filename`, while the rest of the system expected the proper `Filename` column from Google Sheets. That led to a blank filename in the log for one execution.

Once that happens, two bad things become possible:

1. Deduplication breaks because the workflow can no longer reliably tell which article has already been processed.
2. Approval targeting breaks because the row no longer has a clean stable identifier.

That kind of bug is much more dangerous than a visible crash. A crash is loud. Bad state is quiet.

## The Approval Bot Was Too Trusting

The next issue was in the approval workflow itself.

Originally, the approval path used `Status = pending` and returned the first match. That meant if more than one row was pending, a Telegram approval could act on the wrong post.

That is the kind of edge case that feels harmless right up until you are managing multiple queued drafts.

So I changed the approval bot to stop guessing.

The workflow now resolves the exact post instead of blindly taking the first pending row. It also moves the Google Sheets status to `posting` before the LinkedIn API call, which closes an important gap.

Why that matters:

- if LinkedIn succeeds first and Google Sheets fails later, the row is no longer sitting in the same ambiguous `pending` state
- the workflow now has a clearer state transition: `pending` -> `posting` -> `Posted`

That is not glamorous automation work, but it is the difference between a demo and a system you can trust.

## We Kept the Custom LinkedIn HTTP Request

One part of the architecture I did not replace was the custom LinkedIn HTTP Request node.

That custom node posts directly to `/v2/ugcPosts` using OAuth credentials, instead of relying on n8n's native LinkedIn node. After auditing the payload, I kept it.

The request structure is sound for a text-only public post:

- `author`
- `lifecycleState: "PUBLISHED"`
- `com.linkedin.ugc.ShareContent`
- `shareCommentary.text`
- `shareMediaCategory: "NONE"`
- public visibility

In other words, the LinkedIn part was not the weak link. The weak link was orchestration around it.

## Then I Fixed the Human Interface

Once the state bugs were patched, the next problem became obvious immediately:

having to type a full Jekyll filename into Telegram is miserable.

Technically, `/approve 2026-04-21-automating-linkedin-with-n8n-the-full-build.md` works.

Practically, nobody wants that as a daily habit.

So the workflow moved to a better default:

- fastest path: reply directly to the Telegram approval message with `approve` or `skip`
- fallback path: use a short command if replying is inconvenient

Reply-based approval is much nicer because the context is already inside the conversation thread. The bot can pull the filename from the original message you are replying to, which means you do not need to remember or retype anything.

That made the workflow feel far more natural.

## Then We Added a Short Numeric Fallback

There was still one gap.

Replying is great when you use the Reply action properly, but sometimes you still want a standalone fallback command you can type from memory.

The original fallback used full filenames.

I changed that to a six-digit approval code derived from the filename.

So now the approval message includes:

- the title
- the code
- the filename
- the LinkedIn draft

And the fallback commands are now shaped like:

- `/approve 970892`
- `/skip 970892`

That gives the system a compact identifier without adding another fragile manual bookkeeping layer to the spreadsheet.

The approval workflow reads pending rows, computes the same six-digit code from each filename, and resolves the exact row from that match. If there is ambiguity, it refuses to guess and tells me to reply directly to the original message instead.

That is a better failure mode.

## We Also Moved the Workflow to a Dedicated Telegram Bot

Another cleanup from today was creating a dedicated Telegram credential for this LinkedIn flow.

That matters more than it sounds.

If several workflows share one bot credential, rotating tokens or changing webhook behavior becomes riskier because a fix for one system can quietly affect another. By moving the LinkedIn approval flow onto its own Telegram bot, the approval pipeline becomes easier to test, easier to reason about, and less likely to create collateral damage elsewhere in my automations.

This is one of those small infrastructure choices that pays off later.

## What Changed in Practical Terms

By the end of the session, the workflow was in a much healthier place:

- Google Sheets reads and writes now use consistent field names
- pending rows are resolved deliberately instead of by "first match"
- the row is marked `posting` before the LinkedIn post is sent
- successful LinkedIn responses now write back a `LinkedIn Share ID`
- Telegram approvals work by direct reply with plain `approve` or `skip`
- standalone commands use short numeric codes instead of long filenames
- the LinkedIn workflow uses its own Telegram bot credential

None of those changes are flashy on their own.

Together, they turn a brittle posting chain into something much closer to a dependable content system.

## The Real Lesson

The biggest lesson from today had nothing to do with LinkedIn specifically.

It was this:

automation quality lives in identifiers, state transitions, and recovery paths.

Most automations look impressive when everything goes right. The real engineering work starts when you ask questions like:

- What uniquely identifies this item?
- What happens if the external API succeeds but my internal update fails?
- How does the human approve the right thing with minimal friction?
- Can I recover from a partial failure without reposting content?

Those are not glamorous questions, but they are the ones that make an automation survive contact with real life.

I still like the overall architecture we built:

- GitHub as the source of truth for long-form content
- OpenRouter for rewriting into platform-native copy
- Google Sheets as the operational queue
- Telegram as the human approval layer
- LinkedIn posted through a custom HTTP request

That combination works.

What changed today is that the system around it got sharper, safer, and much easier to use.

And honestly, that is usually what "finishing" an automation actually means.

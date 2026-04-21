---
layout: post
title: "How I Built a Full LinkedIn Post Automation with n8n (And the OAuth Errors That Almost Stopped Me)"
date: 2026-04-21 14:00:00 -0500
categories: [automation, n8n, linkedin]
tags: [n8n, linkedin, oauth2, telegram, github, ai, openrouter]
description: "A full walkthrough of building an end-to-end LinkedIn post automation using n8n — connecting LinkedIn OAuth2, debugging scope errors, and wiring up a GitHub-to-LinkedIn pipeline with AI rewriting and Telegram approval."
---

I spent this morning building something I've wanted for a while — a fully automated LinkedIn posting pipeline that pulls from my Jekyll blog, rewrites it with AI, sends it to Telegram for my approval, and posts it with one message.

Here's exactly how it went down, including the errors that tripped me up.

## What We Were Building

The goal was a two-workflow n8n system:

1. Runs on a schedule (Tuesday and Friday, 9am Jamaica time)
2. Pulls the latest unprocessed post from this GitHub blog
3. Sends it to OpenRouter's Mistral model for a LinkedIn rewrite
4. Logs the draft to a Google Sheet with status `pending`
5. Sends it to Telegram for my approval
6. On `/approve`, posts to LinkedIn and updates the log
7. On `/skip`, marks it skipped and moves on

Simple concept. A few sharp edges in execution.

---

## Step 1: LinkedIn OAuth2 — The Two Flags Nobody Tells You About

I already had a LinkedIn Developer App with a Client ID and Secret. The scopes I'd requested:

```
openid  profile  email  w_member_social
```

That's all you need for posting to a personal profile.

I created the credential via the **n8n REST API** rather than the UI — because the UI hides two flags that control which scopes LinkedIn actually gets asked for.

### Scope Error 1: w_organization_social

After clicking Connect, LinkedIn returned:

```
unauthorized_scope_error: Scope "w_organization_social" is not authorized
```

n8n's LinkedIn credential defaults `organizationSupport` to `true`, silently adding the company-page posting scope. Fix: recreate the credential with `organizationSupport: false`.

### Scope Error 2: r_emailaddress

After that fix:

```
unauthorized_scope_error: Scope "r_emailaddress" is not authorized
```

The `legacy` flag defaults to `true`, making n8n request LinkedIn's old scope names — `r_emailaddress` instead of the modern OpenID `email`. Fix: `legacy: false`.

The credential payload that finally worked:

```json
{
  "name": "LinkedIn - Personal",
  "type": "linkedInOAuth2Api",
  "data": {
    "serverUrl": "https://www.linkedin.com",
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET",
    "sendAdditionalBodyProperties": false,
    "additionalBodyProperties": "{}",
    "allowedHttpRequestDomains": "all",
    "organizationSupport": false,
    "legacy": false
  }
}
```

After that, the OAuth popup loaded cleanly, I hit Allow. Done.

---

## Step 2: Why This Needs Two Workflows

One thing worth knowing about n8n: **you cannot pause mid-workflow to wait for a Telegram reply**. The Telegram Trigger is a workflow entry point — not a pause node you can drop in the middle of a run.

The clean solution is two workflows:

### Workflow 1 — Fetch & Draft (Scheduled)

```
Schedule Trigger (Tue & Fri 9am UTC-5)
  → Read Google Sheet — get logged filenames
  → GitHub — list _posts folder
  → Code — find latest file not yet in the log
  → GitHub — fetch file content, decode base64
  → Code — strip Jekyll front matter, extract title/date/body
  → HTTP Request — OpenRouter Mistral rewrites it as a LinkedIn post
  → Google Sheets — log as "pending"
  → Telegram — send draft for approval
```

### Workflow 2 — Approve or Skip (Telegram Trigger, always-on)

```
Telegram Trigger
  → IF: correct chat ID?
  → IF: /approve or /skip?
  → [Approve] Get pending row → Post to LinkedIn → Update status → Confirm
  → [Skip]    Get pending row → Update status to skipped → Confirm
```

Both workflows have an Error Trigger that fires a Telegram alert with the failed node and error message.

---

## Step 3: The AI Rewriter

I used OpenRouter with Mistral 7B Instruct. The system prompt:

> You are a LinkedIn content writer. You take blog posts and rewrite them as engaging LinkedIn posts. Keep the tone warm, conversational, and human. No hashtag spam. Maximum 3 relevant hashtags at the end. No em dashes. End with a soft call to action that invites connection or conversation. Maximum 1300 characters total.

The 1300-character cap matters — LinkedIn buries posts with a "see more" break, and tighter posts perform better.

---

## Step 4: The Google Sheet as Deduplication Source

Before fetching anything from GitHub, Workflow 1 reads the entire log, collects all filenames already in it, and excludes them from candidates. The sheet is the single source of truth for what's been processed.

Columns: `Filename | Post Title | Published Date | Posted At | Status | LinkedIn Draft | Notes`

Status flows: `pending` → `posted` or `skipped`.

---

## What I'd Improve in v1.1

The approval workflow currently finds "the first pending row." If two posts somehow land in pending simultaneously (unlikely on a twice-a-week schedule, but technically possible), the second approval would act on the wrong post.

A cleaner fix: embed the filename directly in the Telegram message and parse it back in Workflow 2. That makes the approval pinned to a specific post, not just "whatever is pending."

That's a 10-minute fix I'll ship next week.

---

Total build time: about 45 minutes. The OAuth scope errors were the only real friction. Once those two flags clicked, the rest was straightforward wiring.

If you're building something similar and run into those scope errors — `organizationSupport: false` and `legacy: false` are the two lines you need.

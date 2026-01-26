---
layout: post
title: "How I Built a Headless CMS with Google Sheets & n8n"
date: 2026-01-26 10:44
---

I love systems that work for me, not against me. As a content creator and IT professional, I didn't want to log into GitHub and write code every time I had a thought. I wanted to write in a simple Google Sheet and have it magically appear on my website.

So, I built an automation using n8n to turn Google Sheets into a "Headless CMS" for my Jekyll site. It sounds simple: Sheet Row → n8n → GitHub Commit → Live Site.

But as any "Creative Technician" knows, the gap between theory and execution is where the real work happens. Here is exactly how I built it, how I broke it, and how I fixed it.

The Architecture
The logic is straightforward:

Trigger: n8n watches a Google Sheet for a specific status: "Ready".

Transform: It takes the Title and Content, cleans them up, and converts them into a Jekyll-friendly Markdown string with "Front Matter" (the metadata at the top of the file).

Upload: It uses the GitHub API to create a new file in my _posts folder.

Update: It writes back to the Sheet to say "Posted" so it doesn't run again.

The "Gotchas" (Where I Messed Up)
Automation is fragile. One wrong character can ruin the whole pipeline.

1. The "Ghost" Newline My workflow kept creating folders instead of files. I’d ask for _posts/my-file.md, and GitHub would create a folder named my-file.md/. The culprit? A hidden \n (newline character) at the end of my file path formula. Automation takes you literally—if you tell it to put a newline at the end of a filename, it interprets that as a directory structure.

2. The Double Equals Disaster I spent an hour fighting a bug where n8n was creating folders named ==_posts in my repository. It turned out I had a typo in my n8n Expression. I wrote =={{ $json.filePath }}. That extra equals sign was treated as text, so n8n literally sent a file path starting with equals signs to GitHub. Always check your raw expressions!

3. The "SHA" Error When testing, I kept getting a 422 Unprocessable Entity error saying "SHA wasn't supplied." Translation: "This file already exists." The GitHub API protects you from accidentally overwriting files. If you use the "Create" operation on a file that already exists, it blocks you. I learned to either delete the old file first or version my titles (e.g., "My Post V2") during testing.

The Frontend Logic
Getting the file into GitHub was step one. Step two was making it show up. My site is static HTML/CSS, but Jekyll uses Liquid Tags to make it dynamic. I added this loop to my homepage to fetch the data automatically:

HTML

{% for post in site.posts limit:3 %}
  <div class="card">
    <h3>{{ post.title }}</h3>
    <p>{{ post.excerpt }}</p>
  </div>
{% endfor %}
Why Do This?
Now, I can blog from my phone. I can blog from a tablet. I can draft 10 posts in a spreadsheet and just change the status to "Ready" when I want them to go live.

This is what I mean by Systems & Soul. The system handles the heavy lifting (deployment, formatting, git commits) so I can focus on the soul (the writing).

Built with n8n, Google Sheets, and a lot of patience.


/**
 * Case studies shown at /work/[slug].
 *
 * Results must be supported by the matching build story or an existing
 * project artifact. Label architecture-only evidence clearly. Add measured
 * numbers (hours saved, sign-ups, response times) only when measured.
 */

export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  type: string;
  year: string;
  /** Offer id from lib/offers.ts, used to preselect the contact form. */
  service: string;
  summary: string;
  image: { src: string; alt: string; width: number; height: number };
  gallery?: { src: string; alt: string; width: number; height: number }[];
  challenge: string[];
  approach: { title: string; copy: string }[];
  resultsHeading?: string;
  results: string[];
  stack: string[];
  quote?: { text: string; source: string; role: string };
  links: { label: string; href: string }[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "ai-reporting-engine",
    title: "AI Reporting Engine: from media to a report",
    client: "Independent build",
    type: "Automation architecture · AI reporting",
    year: "2026",
    service: "automation",
    summary:
      "A multi-route n8n workflow for extracting or transcribing content, preparing an AI prompt and routing a report to email, Telegram and Google Drive.",
    image: {
      src: "/assets/images/Screenshot 2026-04-30 at 11.40.41 AM.webp",
      alt: "n8n reporting workflow showing Google Drive input, transcript and video routes, an AI agent, and email, Telegram and Drive outputs",
      width: 800,
      height: 418,
    },
    challenge: [
      "The workflow starts with files in Google Drive. An existing transcript and a video need different preparation before either can be used to generate a report.",
      "Those input paths need to converge on a shared prompt and report-generation stage, then branch to the destinations where the report will be used.",
    ],
    approach: [
      {
        title: "Route the source file",
        copy: "The saved workflow shows a Google Drive trigger followed by file-type routing. The transcript branch validates, downloads and extracts text; the video branch prepares and downloads the video, then transcribes it with Whisper and formats the transcription.",
      },
      {
        title: "Combine the material for the prompt",
        copy: "Both branches feed a merge step. The workflow then fetches a skills database from Google Sheets, combines the data and prepares the AI prompt.",
      },
      {
        title: "Generate and deliver the report",
        copy: "An AI agent connected to an OpenRouter model feeds a report-generation step. The output branches are labelled Send Email, Send Telegram and Save to Drive.",
      },
    ],
    resultsHeading: "Implementation evidence",
    results: [
      "The workflow screenshot shows separate transcript and video preparation paths leading to one reporting sequence.",
      "Email, Telegram and Google Drive are represented as distinct output branches.",
      "This case study documents the workflow architecture. Measured time savings, delivery success rates and production performance are not included.",
    ],
    stack: ["n8n", "Google Drive", "Google Sheets", "Whisper", "OpenRouter", "Gmail", "Telegram"],
    links: [
      { label: "View the workflow screenshot", href: "/assets/images/Screenshot%202026-04-30%20at%2011.40.41%20AM.webp" },
    ],
  },
  {
    slug: "jps-ai-workshop",
    title: "Hands-on AI training for Jamaica Public Service",
    client: "Jamaica Public Service",
    type: "Corporate AI training",
    year: "2025 & 2026",
    service: "workshop",
    summary:
      "An AI content-creation workshop where every participant scripts, films, edits and shares a video before they leave — and the reason JPS invited me back a second year.",
    image: {
      src: "/assets/images/jps-workshop-2026-1.webp",
      alt: "Willard Wells facilitating a hands-on AI workshop for Jamaica Public Service staff, participants working on laptops in a boardroom",
      width: 1400,
      height: 654,
    },
    gallery: [
      {
        src: "/assets/images/jps-workshop-2026-2.webp",
        alt: "JPS workshop participants applying AI tools on laptops and phones",
        width: 1400,
        height: 654,
      },
    ],
    challenge: [
      "Most workplace AI sessions follow the same pattern: a presenter shows impressive demos, the room leaves inspired, and by Monday nothing has changed.",
      "The room never moves at one speed. Some staff already used ChatGPT daily; others had never opened an AI tool and needed permission to experiment without breaking anything.",
    ],
    approach: [
      {
        title: "Six phases, not forty slides",
        copy: "Discover → Define → Create → Enhance → Share → Grow. A digital-presence audit, a core message, a phone-shot video, a guided CapCut edit, peer review, then LinkedIn habits — a sequence of small, finishable wins.",
      },
      {
        title: "The 3E framework",
        copy: "Entertain, Engage, Educate — in that order. Hook first, connect second, teach third. It is why a one-minute phone video can outperform a polished corporate deck.",
      },
      {
        title: "An interactive guide instead of a projector",
        copy: "Participants follow a browser-based guide with checklists, examples and fallback summaries, so nobody falls behind on step four while the room is on step seven.",
      },
      {
        title: "Specific, individual feedback",
        copy: "Each video draft and LinkedIn profile gets concrete notes — “your hook is eight seconds too long” — instead of “nice job”.",
      },
    ],
    results: [
      "Invited back for a second engagement in August 2026 after the first session in August 2025.",
      "By lunch every participant had shot footage; by mid-afternoon everyone had an edited video; several published before the close.",
      "Participants named automatic captioning as the single most useful thing they took back to their daily work.",
      "Year two cut two lecture segments and gave the time to hands-on editing, based on what worked in year one.",
    ],
    stack: ["AI assistants for research & scripting", "CapCut", "Auto-captioning", "LinkedIn", "Browser-based workshop app"],
    links: [
      { label: "Read the full build story", href: "/blog/how-i-built-and-delivered-a-hands-on-ai-workshop-for-jps-twice" },
    ],
  },
  {
    slug: "instagram-join-bot",
    title: "An Instagram join bot for a growing hiking community",
    client: "Lifestyle Hikers",
    type: "Meta API · Community automation",
    year: "2026",
    service: "automation",
    summary:
      "One automation that answers “how do I join?” across Instagram DMs, story replies and post comments — so the admin team no longer types the same welcome message all day.",
    image: {
      src: "/assets/images/instagram-dm-autoresponder-connected-instagram.webp",
      alt: "Instagram account connected to the automated onboarding workflow",
      width: 1600,
      height: 953,
    },
    challenge: [
      "As the Lifestyle Hikers page grew, the same questions arrived all day — “How do I join?”, “Send the link”, “Can I get the WhatsApp?” — in three different places: DMs, story replies and post comments.",
      "The bot had to answer only genuine join questions, never spam, and stay reliable enough to still make sense months later.",
    ],
    approach: [
      {
        title: "Three entry points, two event types",
        copy: "DMs and story replies arrive as message events and share one reply path. Comments arrive as comment events and need a private reply sent against the comment ID.",
      },
      {
        title: "Only reply when the intent is clear",
        copy: "A keyword filter (join, link, group, whatsapp, how to join, signup, member, community) means “beautiful hike” gets left alone. Most bad automation isn’t broken — it’s too eager.",
      },
      {
        title: "No bot talking to itself",
        copy: "Echo events, edits and read receipts are filtered out, so the workflow never mistakes its own replies for new messages.",
      },
      {
        title: "A welcome that does the onboarding",
        copy: "The reply walks people through following the page, the website, the community form and turning up to hikes — with WhatsApp access after real participation.",
      },
    ],
    results: [
      "Comment “join” on a post → private DM. Reply “join” to a story → welcome DM. Send “join” in a DM → welcome DM.",
      "Replies only to clear join intent; ordinary comments are ignored.",
      "No self-reply loops once echo and non-message events were filtered.",
      "The token type and testing gotchas are documented, so the setup can be maintained without relearning Meta’s quirks.",
    ],
    stack: ["n8n", "Instagram API with Instagram Login", "Meta webhooks", "DigitalOcean"],
    links: [
      { label: "Read the full build story", href: "/blog/how-i-built-an-instagram-join-bot-with-n8n-meta-and-one-very-specific-token" },
      { label: "Related: Instagram DM autoresponder", href: "/blog/how-i-built-an-instagram-dm-autoresponder-with-n8n-and-meta" },
    ],
  },
  {
    slug: "lifestyle-hikers",
    title: "The online home of a Jamaican hiking community",
    client: "Lifestyle Hikers",
    type: "Production platform · Community operations",
    year: "Live",
    service: "website",
    summary:
      "A live platform for Jamaican trails, events, galleries and stories, with publishing and community admin automated behind it.",
    image: {
      src: "/assets/images/hero_image.webp",
      alt: "A Lifestyle Hikers member holding the community logo at a waterfall in Jamaica",
      width: 1200,
      height: 627,
    },
    challenge: [
      "Lifestyle Hikers started in 2019 with five members and grew to more than fifty, hiking across Jamaica for free three Saturdays a month.",
      "A community that size needs a credible home for trails, events and galleries — and far less manual admin than a volunteer team can keep up with.",
    ],
    approach: [
      {
        title: "Git-based publishing",
        copy: "The site is built from Markdown content in a Git repository, so new trails, events and stories go live by committing — no CMS or server to babysit.",
      },
      {
        title: "Automated builds and deploys",
        copy: "GitHub Actions handle builds and deployment on every change.",
      },
      {
        title: "n8n and Telegram behind the scenes",
        copy: "Publishing and admin workflows run through n8n and Telegram — part of the same automated blog pipeline that serves five sites.",
      },
      {
        title: "Onboarding on autopilot",
        copy: "The Instagram join bot answers membership questions across DMs, story replies and comments, and points new people to the website.",
      },
    ],
    results: [
      "Live in production at lifestylehikers.com.",
      "Supports a community that has grown from 5 founding members to 50+.",
      "Content goes live through Git with automated builds — nothing to patch or host manually.",
      "Instagram join questions are handled automatically by the join bot.",
    ],
    stack: ["Jekyll", "GitHub Pages", "GitHub Actions", "n8n", "Telegram", "Meta API"],
    quote: {
      text: "He wasn’t just a developer; he was a true creative partner.",
      source: "Lifestyle Hikers",
      role: "Outdoor community",
    },
    links: [
      { label: "Visit lifestylehikers.com", href: "https://lifestylehikers.com" },
      { label: "Read: the automated blog engine for 5 sites", href: "/blog/automated-seo-blog-engine-n8n-what-broke" },
    ],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

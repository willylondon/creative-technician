import assert from "node:assert/strict";
import test from "node:test";
import {
  formatPostDate,
  getAllPosts,
  getPostBySlug,
  getReadingTime,
  getRelatedPosts,
} from "./posts.ts";

test("getAllPosts parses all published posts with clean content, categories, excerpts and cover alt text", () => {
  const posts = getAllPosts();
  assert.ok(posts.length >= 50, `Expected at least 50 published posts, got ${posts.length}`);

  for (const post of posts) {
    assert.ok(post.slug, "Post must have a slug");
    assert.ok(post.title && post.title !== "Untitled", `Post ${post.slug} must have a title`);
    assert.match(post.date, /^\d{4}-\d{2}-\d{2}/, `Post ${post.slug} must have an ISO date prefix`);
    assert.ok(post.content.length > 0, `Post ${post.slug} must have non-empty body content`);
    assert.ok(post.excerpt && post.excerpt.length > 10, `Post ${post.slug} must have a non-empty excerpt`);

    // No raw Jekyll/Kramdown attribute blocks or empty Markdown headings
    assert.doesNotMatch(
      post.content,
      /\{:[^}\r\n]+\}/,
      `Post ${post.slug} must not contain raw Kramdown attribute blocks`
    );
    assert.doesNotMatch(
      post.content,
      /^#{1,6}[ \t]*$/m,
      `Post ${post.slug} must not contain empty Markdown headings`
    );

    // No leading H1 in body content
    assert.doesNotMatch(
      post.content,
      /^#\s+/m,
      `Post ${post.slug} must not contain an H1 in body content`
    );

    // Cover image must have non-empty coverAlt and must not be duplicated at start of body
    if (post.coverImage) {
      assert.ok(
        post.coverAlt && post.coverAlt.trim().length > 0,
        `Post ${post.slug} with coverImage must have non-empty coverAlt`
      );
      assert.ok(
        !post.content.startsWith(`![`) || !post.content.includes(`](${post.coverImage})`),
        `Post ${post.slug} must not duplicate coverImage at the start of body content`
      );
    }

    // Categories must not retain YAML list dashes or wrapping quotes
    for (const category of post.categories ?? []) {
      assert.doesNotMatch(
        category,
        /^-|^['"]|['"]$/,
        `Post ${post.slug} category "${category}" must be stripped of YAML list markers and quotes`
      );
    }
  }
});

test("multi-line YAML categories parse all items and classify topic accurately", () => {
  const jps = getPostBySlug("how-i-built-and-delivered-a-hands-on-ai-workshop-for-jps-twice");
  assert.ok(jps, "JPS workshop post should exist");
  assert.deepEqual(jps.categories, ["ai", "workshops", "teaching"]);
  assert.equal(jps.topic, "builds");

  const star = getPostBySlug("today-a-star-was-born-and-that-star-is-me");
  assert.ok(star, "Star post should exist");
  assert.deepEqual(star.categories, ["Blog"]);
  assert.equal(star.topic, "life");
});

test("coverAlt preserves descriptive image_alt / Markdown alt text and falls back to post title", () => {
  const bball = getPostBySlug("jamaica-basketball-road-to-qatar-2027");
  assert.ok(bball);
  assert.equal(
    bball.coverAlt,
    "Jamaica national basketball team on the Road to Qatar 2027"
  );

  const nonsuch = getPostBySlug("nonsuch-falls-survival-guide");
  assert.ok(nonsuch);
  assert.equal(nonsuch.coverAlt, nonsuch.title);
});

test("formatPostDate, getReadingTime and getRelatedPosts behave deterministically", () => {
  assert.equal(formatPostDate("2026-08-22"), "August 22, 2026");
  assert.equal(formatPostDate("invalid-date"), "");
  assert.equal(getReadingTime("short text"), 1);

  const related = getRelatedPosts("how-i-built-an-instagram-dm-autoresponder-with-n8n-and-meta", 3);
  assert.equal(related.length, 3);
  assert.ok(related.every((p) => p.topic === "builds"));
});

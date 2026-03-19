Authoring checklist (keeps the same look + faster load)

- Post front matter:
  - `image` is optional now. If you skip it, the site auto-uses `/assets/images/default-post-cover.svg`.
  - If you want a custom cover, use:
  - `image: /assets/images/post-cover.png`
  - `image_width: 1200`
  - `image_height: 630`
- Inline images in posts:
  - Use {: width="W" height="H" loading="lazy" decoding="async" } after the image.
  - Visual size still auto-fits the card because CSS uses max-width: 100%.
- If you skip width/height:
  - It will still look the same, but may cause small layout shifts while loading.

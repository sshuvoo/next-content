---

title: "Hello MDX"
description: "A small but well-structured MDX file to test filesystem-based MDX readers"
date: 2026-01-28
draft: false
price: 100
author: "Shuvo"
name: "Sofware Developer"
avatar: "/images/jane.png"

---

# Hello, MDX 👋

This is a **minimal yet meaningful** MDX document designed to test:

* Frontmatter parsing
* Markdown rendering
* MDX component support
* Code blocks, lists, and links

> MDX lets you mix *content* and *components* seamlessly.

---

## Why MDX?

MDX combines the simplicity of Markdown with the power of JSX.

### Key benefits

1. Write content in Markdown
2. Embed interactive components
3. Keep everything type-safe

---

## Code example

```ts
export type Post = {
  title: string;
  date: string;
};
```

---

## Inline MDX component

<Callout type="info">
  This block tests whether custom MDX components render correctly.
</Callout>

---

## Links & formatting

* Visit the [MDX website](https://mdxjs.com)
* Learn about **frontmatter**, *emphasis*, and `inline code`

---

## Final note

> Good MDX content should be **readable as Markdown** and **powerful as JSX**.

Thanks for testing 🚀

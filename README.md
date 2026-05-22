# next-content 🚀

> A powerful, typed content parser for Next.js, Node.js, and Astro-like architectures. Bring your markdown content to life with Zod validation.

Are you a Next.js aficionado who sometimes looks at Astro's content collections and goes, *"Wow, I wish I had that in Next.js"*? Well, dry those tears! `next-content` is here to give you that Astro-like developer experience right where you feel at home—in Next.js. And guess what? It's completely framework agnostic! Node.js? Yep. Express? You bet.

## Why `next-content`? 🤔

1. **Astro Envy Cure:** Get Astro's content-driven superpower inside your Next.js or Node apps.
2. **Type Safety Galore:** Frontmatter validation powered by Zod. Stop guessing if your markdown has a `title` or `date`. Know it, type it, own it.
3. **Zero Headaches:** It just reads, parses, and validates your files—no weird magic, no hidden files, just good old filesystem reading combined with `gray-matter` and `zod`.

## Installation

```bash
npm install next-content zod
```
*(We assume you also want `zod` for the sweet, sweet validation!)*

## Usage 🛠️

Let's assume you have a folder structure like this:

```text
my-next-app/
├── content/
│   ├── blog/
│   │   ├── hello-world.md
│   │   ├── why-i-love-nextjs.md
│   │   └── _draft.md (Files starting with '_' are ignored automatically!)
├── src/
│   └── lib/
│       └── api.ts
└── package.json
```

### The Basic Way (Without Options)

```typescript
import { parseFiles } from 'next-content';

async function getPosts() {
  // It reads all supported files in the directory
  const posts = await parseFiles('./content/blog');
  
  console.log(posts);
}
```

**Output Example:**
```json
[
  {
    "slug": "hello-world",
    "props": {
      "title": "Hello World",
      "date": "2026-05-22"
    },
    "content": "This is the markdown body of the post!"
  }
]
```

### The Pro Way (With Zod Validation) 🛡️

What if `title` is required, and `date` should be an actual date string? Let's bring in Zod!

```typescript
import { parseFiles, parseFile } from 'next-content';
import { z } from 'zod';

// 1. Define your schema
const BlogSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string(),
  published: z.boolean().default(true),
});

async function getValidPosts() {
  const posts = await parseFiles('./content/blog', {
    schema: BlogSchema,
    // Optional: Filter files before reading them
    preFilter: (filename) => filename.endsWith('.md'),
    // Optional: Filter files after reading and validating them
    postFilter: (props) => props.published === true
  });

  // `posts` is fully typed!
  // posts[0].props.title is a string!
  return posts;
}

// You can also parse a single file!
async function getSinglePost() {
  const post = await parseFile('./content/blog/hello-world.md', {
    schema: BlogSchema
  });
  
  return post;
}
```

## Options

When calling `parseFiles(folderPath, options)` or `parseFile(filePath, options)`, you can pass an `options` object:

- `schema`: A Zod schema to validate your frontmatter. If validation fails, it throws a neatly formatted error.
- `preFilter`: `(filename: string) => boolean`. Filter files before they are read. Useful for ignoring specific extensions or naming patterns. *(Note: files starting with `_` are ignored by default!)*
- `postFilter`: `(props: T) => boolean`. Filter the result *after* parsing and validating. Useful for filtering out drafts or unpublished posts based on frontmatter data.

## Features at a Glance ✨

- **`gray-matter` built-in:** We use the industry standard for parsing frontmatter.
- **Slug generation:** It automatically creates a URL-friendly `slug` from your filename.
- **Ignore Drafts:** Prefix a file with an underscore (e.g., `_secret-post.md`) and it's instantly ignored.
- **Filter Callbacks:** Total control over what gets read and what gets returned.

## Contributing

We love contributions! Whether you're fixing a bug, adding a feature, or just improving this humorous documentation, check out our [Contributing Guide](CONTRIBUTING.md).

## License

MIT - Go crazy.

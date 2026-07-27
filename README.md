# next-content 🚀

> **Astro-Style Content Collections for Next.js, Node.js & Static Applications.**  
> *Type-safe, Zod-validated Markdown & MDX content engine that brings Astro's developer experience to Next.js.*

[![npm version](https://img.shields.io/npm/v/next-content.svg)](https://www.npmjs.com/package/next-content)
[![license](https://img.shields.io/npm/l/next-content.svg)](LICENSE)
[![typescript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

---

## 🌟 Why `next-content`? (The Next.js Content Solution)

If you have ever built a blog, documentation platform, landing page, or content-driven static application in Next.js, you've likely felt the friction of parsing Markdown/MDX: writing custom `fs` scripts, managing frontmatter validation, handling slugs, sorting posts by date, and struggling with type safety.

Astro introduced **Content Collections**—a schema-driven, type-safe approach to local Markdown content. `next-content` brings that exact **Astro DX to Next.js and Node.js applications**!

### Why you don't need to switch to Astro for content apps:
- **Build with Confidence in Next.js:** Keep your favorite React ecosystem, UI libraries, Next.js App Router, React Server Components (RSC), and Server Actions while enjoying top-tier Content Collections DX.
- **Strict Zod Type Safety:** Every Markdown file frontmatter is validated at build-time or run-time with Zod. Full autocompletion for `post.data.title`, `post.data.publishedAt`, etc.
- **Zero Overhead & Zero Magic:** Framework-agnostic pure TypeScript engine using `gray-matter`, `js-yaml`, and `zod`. No hidden database dependencies or heavy build plugins.
- **Optimized for AI Agents & LLMs:** Structured schemas make it effortless for AI agents (like v0, Cursor, Claude, Antigravity) to understand, generate, and query your content structure with total confidence.

---

## 📦 Installation

```bash
npm install next-content zod
# or
pnpm add next-content zod
# or
yarn add next-content zod
```

> **Note:** `zod` is a peer dependency used for defining frontmatter schemas.

---

## 🚀 Quick Start (3 Easy Steps)

### 1. Structure Your Content Directory

```text
my-next-app/
├── content/
│   ├── blog/
│   │   ├── getting-started.md
│   │   └── advanced-nextjs.md
│   └── docs/
│       ├── introduction.md
│       └── installation.md
├── src/
│   └── content.config.ts
└── app/
    └── blog/
        └── page.tsx
```

### 2. Define Your Collections (`src/content.config.ts`)

```typescript
import { Collection, ContentRegistry } from 'next-content'
import * as z from 'zod'

// Define the Blog Collection
export const blog = new Collection({
  path: 'blog',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
})

// Define the Docs Collection
export const docs = new Collection({
  path: 'docs',
  schema: z.object({
    title: z.string(),
    order: z.number().default(0),
  }),
})

// Create and export the Content Registry
export const content = new ContentRegistry({
  basePath: 'content', // Root content directory relative to process.cwd()
  collections: [blog, docs],
  extensions: ['.md', '.mdx'],
})
```

### 3. Query in Next.js App Router (`app/blog/page.tsx`)

```tsx
import { content } from '@/content.config'
import Link from 'next/link'

export default async function BlogListingPage() {
  // Fetch all posts in the blog collection (fully typed!)
  const posts = await content.getCollection('blog')

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <article key={post.id} className="p-6 border rounded-lg hover:shadow-md transition">
            <Link href={`/blog/${post.id}`}>
              <h2 className="text-2xl font-semibold mb-2">{post.data.title}</h2>
            </Link>
            <p className="text-gray-600 mb-4">{post.data.description}</p>
            <span className="text-sm text-gray-400">Published: {post.data.publishedAt}</span>
          </article>
        ))}
      </div>
    </main>
  )
}
```

---

## 📖 Deep Dive & API Reference

`next-content` consists of two main building blocks: **`Collection`** and **`ContentRegistry`**.

### 1. `Collection`

A `Collection` represents a specific content directory (e.g., `content/blog`, `content/authors`, `content/changelog`).

```typescript
import { Collection } from 'next-content'
import * as z from 'zod'

const blogCollection = new Collection({
  path: 'blog',
  schema: z.object({
    title: z.string(),
  }),
  // ... optional configuration
})
```

#### Configuration Options

| Option | Type | Required? | Default / Fallback | Description |
| :--- | :--- | :--- | :--- | :--- |
| `path` | `string` | **Yes** | — | Directory name/path of the collection relative to `basePath`. |
| `schema` | `z.ZodType` | **Yes** | — | Zod schema used to validate frontmatter key-value pairs. |
| `basePath` | `string` | No | Registry `basePath` (or `'/'`) | Overrides the root directory path for this collection. |
| `extensions` | `string[]` | No | Registry `extensions` (or `['.md', '.mdx']`) | List of allowed file extensions. |
| `genId` | `Function` | No | Built-in `slugify(filePath)` | Custom function to generate the entry `id` (slug). |
| `filter` | `Function` | No | Keep all entries | Predicate function to include/exclude entries. |
| `sort` | `Function` | No | Natural filesystem order | Comparator function to sort collection entries. |
| `transform` | `Function` | No | Return entry unchanged | Mutates or enriches entry data before returning. |

---

### 💡 Deep Dive: Why `genId` Shines

The `genId` option generates unique, clean identifiers (`id`) for each content file.

#### Signature
```typescript
genId: (filePath: string, data: z.infer<typeof schema>) => string
```

#### Default Fallback Behavior
If `genId` is **not provided**, `next-content` uses the built-in `slugify` helper.  
`slugify` strips file extensions, replaces spaces/special characters with hyphens, and converts to lowercase.

- `my-first-post.md` ➡️ `id: "my-first-post"`
- `Hello World & Beyond!.mdx` ➡️ `id: "hello-world-and-beyond"`

#### Real-World Use Cases for `genId`

1. **Stripping Date Prefixes from Filenames:**  
   If your Markdown files are named `2026-07-27-my-awesome-post.md`, but you want clean URLs like `/blog/my-awesome-post`:
   ```typescript
   export const blog = new Collection({
     path: 'blog',
     schema: z.object({ title: z.string() }),
     genId: (filePath) => {
       // Remove date prefix 'YYYY-MM-DD-' and extension
       return filePath.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.[^/.]+$/, '')
     },
   })
   ```

2. **Using Frontmatter Slug Overrides:**  
   Allow authors to explicitly override the URL slug inside frontmatter data:
   ```typescript
   export const blog = new Collection({
     path: 'blog',
     schema: z.object({
       title: z.string(),
       customSlug: z.string().optional(),
     }),
     genId: (filePath, data) => {
       if (data.customSlug) return data.customSlug
       return filePath.replace(/\.[^/.]+$/, '').toLowerCase()
     },
   })
   ```

3. **Handling Nested Folders / Hierarchical Docs:**  
   Convert nested paths (e.g. `getting-started/installation.md`) into a clean slug:
   ```typescript
   genId: (filePath) => filePath.replace(/\\/g, '/').replace(/\.[^/.]+$/, '')
   ```

---

### 💡 Deep Dive: Why `transform` Shines

The `transform` method allows you to process or compute custom dynamic fields at runtime *after* validation and parsing are complete.

#### Signature
```typescript
transform: (entry: Entry<T>) => any
```
*An `Entry<T>` object contains `{ id: string, data: T, content: string }`.*

#### Default Fallback Behavior
If `transform` is **not provided**, `next-content` returns the raw entry object `{ id, data, content }` directly.

#### Real-World Use Cases for `transform`

1. **Dynamic Reading Time Calculation:**  
   Automatically calculate estimated reading time based on Markdown body length:
   ```typescript
   function calculateReadingTime(content: string): number {
     const words = content.trim().split(/\s+/).length
     return Math.ceil(words / 200) // ~200 words per minute
   }

   export const blog = new Collection({
     path: 'blog',
     schema: z.object({
       title: z.string(),
     }),
     transform: (entry) => ({
       ...entry,
       data: {
         ...entry.data,
         readingTime: calculateReadingTime(entry.content),
       },
     }),
   })
   ```

2. **Generating Automatic Excerpts:**  
   Extract the first paragraph of Markdown content if no explicit summary is provided:
   ```typescript
   export const blog = new Collection({
     path: 'blog',
     schema: z.object({
       title: z.string(),
       excerpt: z.string().optional(),
     }),
     transform: (entry) => {
       const excerpt = entry.data.excerpt || entry.content.slice(0, 160).trim() + '...'
       return {
         ...entry,
         data: { ...entry.data, excerpt },
       }
     },
   })
   ```

3. **Injecting Formatted Dates or Absolute URLs:**  
   Format ISO date strings into human-readable strings:
   ```typescript
   transform: (entry) => ({
     ...entry,
     data: {
       ...entry.data,
       formattedDate: new Date(entry.data.publishedAt).toLocaleDateString('en-US', {
         month: 'long',
         day: 'numeric',
         year: 'numeric',
       }),
     },
   })
   ```

---

### 2. `ContentRegistry`

The `ContentRegistry` acts as the central hub managing your collections, global fallbacks, and content fetching queries.

```typescript
import { ContentRegistry } from 'next-content'

export const content = new ContentRegistry({
  basePath: 'content',
  collections: [blog, docs],
  // Optional registry-level fallbacks:
  extensions: ['.md', '.mdx'],
})
```

#### Fallback Configuration Cascade

`next-content` uses a flexible hierarchical fallback system for infrastructure settings (`basePath`, `extensions`, `genId`):
```text
Collection Option  ➡️  Registry Option  ➡️  Library Default
```
If a `Collection` does not specify `basePath`, `extensions`, or `genId`, it automatically falls back to the setting defined in `ContentRegistry`. Collection-specific transformations, sorting, and filtering (`transform`, `sort`, `filter`) are configured directly at the `Collection` level.

---

### 🛠️ Query Methods

#### 1. `getCollection(path)`
Fetches, validates, filters, sorts, and transforms **all entries** in a collection.

```typescript
const posts = await content.getCollection('blog')
// Returns: Entry<BlogSchema>[]
```

#### 2. `getEntry(path, id)`
Retrieves a **single entry** matching the given `id` (slug). Returns `null` if not found or filtered out.

```typescript
const post = await content.getEntry('blog', 'getting-started')
if (!post) {
  notFound() // Next.js 404
}
console.log(post.data.title, post.content)
```

#### 3. `getEntries(path, ids)`
Retrieves **multiple specific entries** matching an array of `id` strings. Great for related posts, featured items, or pinned docs.

```typescript
const featuredPosts = await content.getEntries('blog', ['getting-started', 'advanced-nextjs'])
```

---

## ⚡ Framework Integration Examples

### Next.js App Router (Recommended)

#### 📄 `app/blog/[slug]/page.tsx` (Static Site Generation - SSG)

```tsx
import { content } from '@/content.config'
import { notFound } from 'next/navigation'

// 🎯 Pre-render all blog posts statically at build time
export async function generateStaticParams() {
  const posts = await content.getCollection('blog')
  return posts.map((post) => ({
    slug: post.id,
  }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await content.getEntry('blog', slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="prose mx-auto py-12 px-4">
      <h1>{post.data.title}</h1>
      <p className="text-gray-500">Reading time: {post.data.readingTime} min</p>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

---

### Next.js Pages Router

#### 📄 `pages/blog/[slug].tsx`

```tsx
import { content } from '@/content.config'
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await content.getCollection('blog')
  const paths = posts.map((post) => ({
    params: { slug: post.id },
  }))

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string
  const post = await content.getEntry('blog', slug)

  if (!post) {
    return { notFound: true }
  }

  return { props: { post } }
}

export default function BlogPostPage({ post }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <article>
      <h1>{post.data.title}</h1>
      <div>{post.content}</div>
    </article>
  )
}
```

---

### Node.js / Express / Standalone Scripts

```typescript
import { Collection, ContentRegistry } from 'next-content'
import { z } from 'zod'

const docs = new Collection({
  path: 'docs',
  schema: z.object({ title: z.string() }),
})

const registry = new ContentRegistry({
  basePath: './content',
  collections: [docs],
})

async function run() {
  const entries = await registry.getCollection('docs')
  console.log(`Found ${entries.length} doc files.`)
}

run()
```

---

## 🛠️ Edge Cases & Advanced Scenarios

### Edge Case 1: Multi-Collection Author Relationships

Link entries across collections (e.g. associating a blog post to an author collection by ID):

```typescript
// 1. Authors Collection
export const authors = new Collection({
  path: 'authors',
  schema: z.object({
    name: z.string(),
    avatar: z.string(),
  }),
})

// 2. Posts Collection referencing Author ID
export const blog = new Collection({
  path: 'blog',
  schema: z.object({
    title: z.string(),
    authorId: z.string(),
  }),
})

export const content = new ContentRegistry({
  basePath: 'content',
  collections: [authors, blog],
})

// Helper to get post with author details
async function getPostWithAuthor(slug: string) {
  const post = await content.getEntry('blog', slug)
  if (!post) return null

  const author = await content.getEntry('authors', post.data.authorId)
  return { ...post, author: author?.data || null }
}
```

---

## 🔄 Upgrade Guide (Migrating to v2+)

In version **1.2.0+**, `next-content` introduced a new schema-driven architecture centered around `Collection` and `ContentRegistry`. The legacy top-level functions `parseFiles` and `parseFile` have been completely removed.

### Quick Migration Cheat Sheet

#### ❌ Old Version (Deprecated / Removed)
```typescript
import { parseFiles, parseFile } from 'next-content'
import { z } from 'zod'

// Old query
const posts = await parseFiles('./content/blog', {
  schema: z.object({ title: z.string() }),
})
```

#### ✅ New Version (v1.2+)
```typescript
import { Collection, ContentRegistry } from 'next-content'
import { z } from 'zod'

// 1. Define collection
const blog = new Collection({
  path: 'blog',
  schema: z.object({ title: z.string() }),
})

// 2. Define registry
const content = new ContentRegistry({
  basePath: 'content',
  collections: [blog],
})

// 3. Modern query
const posts = await content.getCollection('blog')
const singlePost = await content.getEntry('blog', 'my-post-slug')
```

### Key Migration Changes to Note:
1. **`slug` is now `id`**: In `Entry<T>`, the property `slug` is renamed to `id` for consistency with Astro's entry model.
2. **`props` is now `data`**: In `Entry<T>`, frontmatter data is accessible under `entry.data` (previously `entry.props`).
3. **Structured Registry**: Replace ad-hoc function calls with a centralized `content.config.ts` file for clean, predictable configuration across your application.

---

## 📄 License

[MIT](LICENSE) © [sshuvo](https://github.com/sshuvoo)

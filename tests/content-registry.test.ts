import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import z from 'zod'
import { Collection } from '../src/collection'
import { ContentRegistry } from '../src/content-registry'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'

describe('ContentRegistry', () => {
  const testDir = resolve(process.cwd(), 'temp-test-content/posts')

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true })
    await fs.writeFile(
      resolve(testDir, 'post-1.md'),
      '---\ntitle: Post One\nauthor: Alice\n---\n\n# Post One Content',
    )
    await fs.writeFile(
      resolve(testDir, 'post-2.mdx'),
      '---\ntitle: Post Two\nauthor: Bob\n---\n\n## Post Two Content',
    )
  })

  afterAll(async () => {
    await fs.rm(resolve(process.cwd(), 'temp-test-content'), {
      recursive: true,
      force: true,
    })
  })

  it('should get all collection entries using getCollection', async () => {
    const posts = new Collection({
      path: 'posts',
      basePath: 'temp-test-content',
      schema: z.object({
        title: z.string(),
        author: z.string(),
      }),
    })

    const registry = new ContentRegistry({
      collections: [posts],
    })

    const collection = await registry.getCollection('posts')
    expect(collection).toHaveLength(2)
    const post1 = collection.find((p) => p.id === 'post-1')
    expect(post1).toBeDefined()
    expect(post1?.data).toEqual({ title: 'Post One', author: 'Alice' })
    expect(post1?.content.trim()).toBe('# Post One Content')
  })

  it('should retrieve a specific entry using getEntry', async () => {
    const posts = new Collection({
      path: 'posts',
      basePath: 'temp-test-content',
      schema: z.object({
        title: z.string(),
        author: z.string(),
      }),
    })

    const registry = new ContentRegistry({
      collections: [posts],
    })

    const entry = await registry.getEntry('posts', 'post-2')
    expect(entry).not.toBeNull()
    expect(entry?.id).toBe('post-2')
    expect(entry?.data.title).toBe('Post Two')

    const nonExistent = await registry.getEntry('posts', 'unknown')
    expect(nonExistent).toBeNull()
  })

  it('should throw an error if querying an unregistered collection in getEntry', async () => {
    const registry = new ContentRegistry({
      collections: [],
    })

    await expect(registry.getEntry('unknown' as any, 'post-1')).rejects.toThrow(
      'Collection with path "unknown" not registered with ContentRegistry.',
    )
  })

  it('should respect filter and transform in getEntry', async () => {
    const posts = new Collection({
      path: 'posts',
      basePath: 'temp-test-content',
      schema: z.object({
        title: z.string(),
        author: z.string(),
      }),
      filter: (entry) => entry.data.author === 'Alice',
      transform: (entry) => ({ ...entry, id: `transformed-${entry.id}` }),
    })

    const registry = new ContentRegistry({
      collections: [posts],
    })

    const entry1 = await registry.getEntry('posts', 'transformed-post-1')
    expect(entry1).not.toBeNull()
    expect(entry1?.id).toBe('transformed-post-1')

    // post-2 is authored by Bob, so filter excludes it
    const entry2 = await registry.getEntry('posts', 'post-2')
    expect(entry2).toBeNull()
  })

  it('should retrieve multiple entries using getEntries', async () => {
    const posts = new Collection({
      path: 'posts',
      basePath: 'temp-test-content',
      schema: z.object({
        title: z.string(),
        author: z.string(),
      }),
    })

    const registry = new ContentRegistry({
      collections: [posts],
    })

    const entries = await registry.getEntries('posts', ['post-1', 'post-2'])
    expect(entries).toHaveLength(2)
    expect(entries.map((e) => e.id)).toEqual(['post-1', 'post-2'])

    const subset = await registry.getEntries('posts', ['post-1', 'unknown'])
    expect(subset).toHaveLength(1)
    expect(subset[0].id).toBe('post-1')
  })
})


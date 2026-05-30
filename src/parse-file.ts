import matter from 'gray-matter'
import yaml from 'js-yaml'
import * as fs from 'node:fs/promises'
import * as z from 'zod'
import type { TParseFile } from './types'
import { isSupportedFile, resolvePath, slugify } from './utils'

export async function parseFile<T extends z.ZodType>(
  file_path: string,
  schema: T = z.any().optional() as unknown as T,
): Promise<TParseFile<T>> {
  try {
    const isValid = isSupportedFile(file_path)
    if (!isValid) {
      throw new Error('Supports only .md, .mdx and .markdown file')
    }
    const resolvedPath = resolvePath(file_path)
    const rawContent = await fs.readFile(resolvedPath, 'utf-8')
    const parsedContent = matter(rawContent, {
      engines: {
        yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
      },
    })
    const frontmatter = parsedContent.data
    const content = parsedContent.content
    const slug = slugify(file_path)

    const { success, data: props, error } = schema.safeParse(frontmatter)
    if (!success) {
      throw new Error(z.prettifyError(error))
    }

    return { slug, props, content }
  } catch (error) {
    throw new Error(
      `Failed to read file at ${file_path}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

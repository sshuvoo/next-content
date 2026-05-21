import matter from 'gray-matter'
import * as fs from 'node:fs/promises'
import type { TParseFile } from './types'
import { isSupportedFile, resolvePath, slugify } from './utils'
import * as z from 'zod'

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
    const parsedContent = matter(rawContent)
    const frontmatter = JSON.parse(JSON.stringify(parsedContent.data))
    const content = parsedContent.content
    const slug = slugify(file_path)

    const { success, data, error } = schema.safeParse(frontmatter)
    if (!success) {
      throw new Error(z.prettifyError(error))
    }

    return {
      slug,
      frontmatter: data,
      content,
    }
  } catch (error) {
    throw new Error(
      `Failed to read file at ${file_path}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

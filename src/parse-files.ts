import matter from 'gray-matter'
import * as fs from 'node:fs/promises'
import path from 'node:path'
import { isSupportedFile, resolvePath, slugify } from './utils'
import type { TParseFile, TParseFilesOptions } from './types'
import * as z from 'zod'

export async function parseFiles<T extends z.ZodType>(
  folder_path: string,
  options: TParseFilesOptions<T> = {
    preFilter: () => true,
    postFilter: () => true,
    schema: z.any().optional() as unknown as T,
  },
): Promise<TParseFile<T>[]> {
  const { preFilter, postFilter, schema } = options
  const resolvedPath = resolvePath(folder_path)
  const filesPath = await fs.readdir(resolvedPath)
  const filterPaths = filesPath.filter((file_path) => {
    if (!isSupportedFile(file_path)) return false
    if (!file_path.startsWith('_')) return false
    return preFilter!(file_path)
  })

  const promises = filterPaths.map(async (file_path) => {
    const slug = slugify(file_path)
    const filePathFull = path.join(folder_path, file_path)
    const resolvedPath = resolvePath(filePathFull)
    const rawContent = await fs.readFile(resolvedPath, 'utf-8')
    const parsedContent = matter(rawContent)
    const props = JSON.parse(JSON.stringify(parsedContent.data)) as T
    const content = parsedContent.content

    const { success, data, error } = schema.safeParse(props)
    if (!success) {
      throw new Error(z.prettifyError(error))
    }

    return { slug, props: data, content }
  })

  const fileContents = await Promise.all(promises)

  const filteredContents = fileContents.filter((item) =>
    postFilter!(item.props),
  )

  return filteredContents
}

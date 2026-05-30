import matter from 'gray-matter'
import yaml from 'js-yaml'
import * as fs from 'node:fs/promises'
import path from 'node:path'
import * as z from 'zod'
import type { TParseFile, TParseFilesOptions } from './types'
import { isSupportedFile, resolvePath, slugify } from './utils'

export async function parseFiles<T extends z.ZodType>(
  folder_path: string,
  options: TParseFilesOptions<T> = {
    schema: z.any().optional() as unknown as T,
  },
): Promise<TParseFile<T>[]> {
  const { preFilter, postFilter, schema } = options
  const isPreFilterFunc = typeof preFilter === 'function'
  if (preFilter && !isPreFilterFunc)
    throw new Error('preFilter must be a filter callback function')
  const isPostFilterFunc = typeof postFilter === 'function'
  if (postFilter && !isPostFilterFunc)
    throw new Error('postFilter must be a filter callback function')
  const resolvedPath = resolvePath(folder_path)
  const filesPath = await fs.readdir(resolvedPath)
  const filterPaths = filesPath.filter((file_path) => {
    if (!isSupportedFile(file_path)) return false
    if (file_path.startsWith('_')) return false
    return isPreFilterFunc ? preFilter(file_path) : true
  })

  const promises = filterPaths.map(async (file_path) => {
    const slug = slugify(file_path)
    const filePathFull = path.join(folder_path, file_path)
    const resolvedPath = resolvePath(filePathFull)
    const rawContent = await fs.readFile(resolvedPath, 'utf-8')
    const parsedContent = matter(rawContent, {
      engines: {
        yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
      },
    })
    const props = parsedContent.data
    const content = parsedContent.content

    const { success, data, error } = schema.safeParse(props)
    if (!success) {
      throw new Error(z.prettifyError(error))
    }

    return { slug, props: data, content }
  })

  const fileContents = await Promise.all(promises)

  if (!isPostFilterFunc) return fileContents

  const filteredContents = fileContents.filter((item) =>
    postFilter(item.props, item.slug),
  )

  return filteredContents
}

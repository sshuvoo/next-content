import matter from 'gray-matter'
import yaml from 'js-yaml'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import * as z from 'zod'
import type { Collection } from './collection'
import type { ContentRegistryConfig, Entry } from './types'
import { slugify } from './utils'

export class ContentRegistry<
  C extends readonly Collection<any, any>[] = readonly Collection<any, any>[],
> {
  #collections: Map<string, C[number]>
  #basePath: string
  #extensions: string[]
  #genId?: ContentRegistryConfig<C>['genId']
  #onInvalid?: ContentRegistryConfig<C>['onInvalid']

  constructor(config: ContentRegistryConfig<C>) {
    this.#collections = new Map(
      config.collections.map((collection) => [collection.path, collection]),
    )
    this.#basePath = config.basePath || '/'
    this.#extensions = Array.isArray(config.extensions)
      ? config.extensions
      : ['.md', '.mdx']

    this.#genId = config.genId
    this.#onInvalid = config.onInvalid
  }

  public async getCollection<P extends C[number]['path']>(
    path: P,
  ): Promise<
    (Extract<C[number], { path: P }> extends Collection<infer S, P>
      ? Entry<S>
      : Entry)[]
  > {
    const collection = this.#collections.get(path)
    if (!collection) {
      throw new Error(
        `Collection with path "${path}" not registered with ContentRegistry.`,
      )
    }

    try {
      const absDir = resolve(
        cwd(),
        collection.basePath || this.#basePath,
        collection.path,
      )
      const filesPath = await fs.readdir(absDir)

      const allowedExts = collection.extensions || this.#extensions

      const extFilters = filesPath.filter((file_path) =>
        allowedExts.some((ext) => file_path.endsWith(ext)),
      )

      const getId = collection.genId || this.#genId || slugify

      const promises = extFilters.map(async (file_path) => {
        const absPath = resolve(absDir, file_path)
        const rawContent = await fs.readFile(absPath, 'utf-8')
        const parsedContent = matter(rawContent, {
          engines: {
            yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
          },
        })
        const props = parsedContent.data
        const content = parsedContent.content
        const id = getId(file_path, props)

        const { success, data, error } = collection.schema.safeParse(props)
        if (!success) {
          throw new Error(z.prettifyError(error))
        }

        return { id, data, content }
      })

      let fileContents = await Promise.all(promises)

      const filterFunc = collection.filter
      if (typeof filterFunc === 'function') {
        fileContents = fileContents.filter((entry) => filterFunc(entry))
      }

      const sortFunc = collection.sort
      if (typeof sortFunc === 'function') {
        fileContents = fileContents.sort(sortFunc)
      }

      const transformFunc = collection.transform
      if (typeof transformFunc === 'function') {
        fileContents = fileContents.map((entry) => transformFunc(entry))
      }

      return fileContents as (Extract<
        C[number],
        { path: P }
      > extends Collection<infer S, P>
        ? Entry<S>
        : Entry)[]
    } catch (error) {
      const onInvalidFunc = collection.onInvalid || this.#onInvalid
      if (typeof onInvalidFunc === 'function') {
        console.error(error)
        onInvalidFunc(error as Error)
      }
      return []
    }
  }

  public async getEntry<P extends C[number]['path']>(
    path: P,
    id: string,
  ): Promise<
    | (Extract<C[number], { path: P }> extends Collection<infer S, P>
        ? Entry<S>
        : Entry)
    | null
  > {
    const entries = await this.getCollection(path)
    const entry = entries.find((e) => e.id === id)
    return entry ?? null
  }

  public async getEntries<P extends C[number]['path']>(
    path: P,
    ids: string[],
  ): Promise<
    (Extract<C[number], { path: P }> extends Collection<infer S, P>
      ? Entry<S>
      : Entry)[]
  > {
    let entries = await this.getCollection(path)
    entries = entries.filter((e) => ids.includes(e.id))
    return entries
  }
}

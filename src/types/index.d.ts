import type { Collection } from '@/collection'
import type z from 'zod'

export interface Entry<T = any> {
  id: string
  data: z.infer<T>
  content: string
}

export interface CollectionConfig<
  T extends z.ZodType = z.ZodType,
  P extends string = string,
> {
  schema: T
  basePath?: string
  path: P
  extensions?: string[]
  genId?: (filePath: string, data: z.infer<T>) => string
  filter?: (entry: Entry<T>) => boolean
  sort?: (a: Entry<T>, b: Entry<T>) => number
  transform?: (entry: Entry<T>) => any
  onInvalid?: (error: Error) => void
}

export interface ContentRegistryConfig<
  C extends readonly Collection<any, any>[] = readonly Collection<any, any>[],
> {
  collections: C
  basePath?: string
  extensions?: string[]
  genId?: (filePath: string, data: any) => string
  onInvalid?: (error: Error) => void
}


import * as z from 'zod'
import type { CollectionConfig } from './types'

export class Collection<
  T extends z.ZodType = z.ZodType,
  P extends string = string,
> {
  readonly schema: T
  readonly basePath?: string
  readonly path: P
  readonly extensions?: string[]
  readonly genId?: CollectionConfig<T, P>['genId']
  readonly filter?: CollectionConfig<T, P>['filter']
  readonly sort?: CollectionConfig<T, P>['sort']
  readonly transform?: CollectionConfig<T, P>['transform']

  constructor(config: CollectionConfig<T, P>) {
    this.schema = config.schema
    this.basePath = config.basePath
    this.path = config.path
    this.extensions = config.extensions
    this.genId = config.genId
    this.filter = config.filter
    this.sort = config.sort
    this.transform = config.transform
  }
}

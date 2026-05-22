import type z from 'zod'

export type TParseFile<T extends z.ZodType = z.ZodType> = {
  slug: string
  props: z.infer<T>
  content: string
}

export type TParseFilesOptions<T extends z.ZodType = z.ZodType> = {
  schema: T
  preFilter?: (file_path: string) => boolean
  postFilter?: (props: z.infer<T>) => boolean
}

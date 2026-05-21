import path from 'node:path'

export function slugify(str: string): string {
  if (typeof str !== 'string') {
    throw new Error('slugify: expected a string')
  }

  let slug = path.parse(str).name

  slug = slug.replace(/&/g, 'and')

  slug = slug.replace(/[^\p{L}\p{N}]+/gu, ' ')

  slug = slug.trim()

  slug = slug.replace(/^-+|-+$/g, '')

  slug = slug.replace(/\s+/g, '-')

  return slug.toLowerCase()
}

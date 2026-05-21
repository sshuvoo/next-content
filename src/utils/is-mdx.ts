import path from 'node:path'

const supported = new Set(['.md', '.markdown', '.mdx'])

export function isSupportedFile(file_path: string): boolean {
  const extname = path.extname(file_path).toLowerCase()
  return supported.has(extname)
}

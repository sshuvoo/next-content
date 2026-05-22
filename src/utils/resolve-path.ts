import { isAbsolute, resolve } from 'node:path'
import { cwd } from 'node:process'

export function resolvePath(path: string): string {
  const isAbsPath = isAbsolute(path)
  const finalPath = isAbsPath ? path : resolve(cwd(), path)
  return finalPath
}

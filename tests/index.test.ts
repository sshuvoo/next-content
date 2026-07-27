import { describe, expect, it } from 'vitest'
import { Collection, ContentRegistry } from '../src'

describe('Exports', () => {
  it('should export Collection and ContentRegistry', () => {
    expect(Collection).toBeDefined()
    expect(ContentRegistry).toBeDefined()
  })
})

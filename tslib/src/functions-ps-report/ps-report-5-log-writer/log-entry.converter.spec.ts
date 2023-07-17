import { PsLogEntryConverter } from './log-entry.converter'

let sut: PsLogEntryConverter

describe('log entry converter', () => {
  beforeEach(() => {
    sut = new PsLogEntryConverter()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('if no entries, emtpy buffer is returned', () => {
    const input = new Array<string>()
    const output = sut.convert(input)
    expect(output).toBeUndefined()
  })

  test('entries should be prepended with a new line', () => {
    const input = ['foo']
    const output = sut.convert(input)
    expect(output?.toString()).toBe('\nfoo')
  })
})

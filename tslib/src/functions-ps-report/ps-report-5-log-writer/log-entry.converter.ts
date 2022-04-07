export class PsLogEntryConverter {
  convert (entries: string[]): Buffer | undefined {
    if (entries.length === 0) return
    return Buffer.from(`\n${entries.join('\n')}`)
  }
}

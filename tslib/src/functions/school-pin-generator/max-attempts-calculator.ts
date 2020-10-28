export class MaxAttemptsCalculator {
  calculate (wordCount: number, charCount: number): number {
    return (wordCount * wordCount) * (charCount * charCount)
  }
}

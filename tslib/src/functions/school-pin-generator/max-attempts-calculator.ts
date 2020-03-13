export class MaxAttemptsCalculator {
  calculate (wordCount: number, charCount: number) {
    return (wordCount * wordCount) * (charCount * charCount)
  }
}

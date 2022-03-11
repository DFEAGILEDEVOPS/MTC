export interface IJobOutput {
  getStandardOutput(): string
  getErrorOutput(): string
  hasError(): boolean
  reset(): void
}

export class SchoolImportJobOutput implements IJobOutput {
  constructor () {
    this.stderr = []
    this.stdout = []
    this.linesProcessed = 0
    this.schoolsLoaded = 0
  }

  getStandardOutput (): string {
    return this.stdout.join('\n')
  }

  getErrorOutput (): string {
    return this.stderr.join('\n')
  }

  hasError (): boolean {
    return this.stderr.length > 0
  }

  reset (): void {
    this.stdout = []
    this.stderr = []
    this.linesProcessed = 0
    this.schoolsLoaded = 0
  }

  stdout: string[]
  stderr: string[]
  schoolsLoaded: number
  linesProcessed: number
}

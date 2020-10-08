export class SchoolImportJobResult {
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

  reset (): void {
    this.stdout = []
    this.stderr = []
    this.linesProcessed = 0
    this.schoolsLoaded = 0
  }

  stdout: Array<string>
  stderr: Array<string>
  schoolsLoaded: number
  linesProcessed: number
}

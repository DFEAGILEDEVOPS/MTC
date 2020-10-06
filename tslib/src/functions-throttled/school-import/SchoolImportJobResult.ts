
export class SchoolImportJobResult {
  constructor () {
    this.stderr = []
    this.stdout = []
    this.linesProcessed = 0
    this.schoolsLoaded = 0
  }

  stdout: Array<string>
  stderr: Array<string>
  schoolsLoaded: number
  linesProcessed: number
}

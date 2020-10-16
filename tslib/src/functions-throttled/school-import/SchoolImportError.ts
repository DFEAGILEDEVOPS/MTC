import { SchoolImportJobResult } from './SchoolImportJobResult'

export class SchoolImportError extends Error {
  constructor (jobResult: SchoolImportJobResult , innerError: Error) {
    super(innerError.message)
    this.jobResult = jobResult
    this.innerError = innerError
  }
  jobResult: SchoolImportJobResult
  innerError: Error
}

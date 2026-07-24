import { type SchoolImportJobOutput } from './SchoolImportJobOutput.js'

export class SchoolImportError extends Error {
  constructor (jobResult: SchoolImportJobOutput, innerError: Error) {
    super(innerError.message)
    this.jobResult = jobResult
    this.innerError = innerError
  }

  jobResult: SchoolImportJobOutput
  innerError: Error
}

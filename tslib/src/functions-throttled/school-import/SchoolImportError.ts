import { SchoolImportJobResult } from './SchoolImportJobResult'

export class SchoolImportError extends Error {
  constructor (jobResult: SchoolImportJobResult , message?: string) {
    super(message)
    this.jobResult = jobResult
  }
  jobResult: SchoolImportJobResult
}

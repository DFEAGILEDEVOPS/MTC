import { SchoolImportJobOutput } from './SchoolImportJobOutput'

describe('SchoolImportJobResult', () => {
  let jobResult: SchoolImportJobOutput

  beforeEach(() => {
    jobResult = new SchoolImportJobOutput()
    jobResult.stderr.push('error 1')
    jobResult.stdout.push('out 1')
    jobResult.stdout.push('out 2')
    jobResult.stderr.push('error 2')
    jobResult.schoolsLoaded = 100
    jobResult.linesProcessed = 101
  })

  test('getStandardOut returns stdout as a string', () => {
    const stdout = jobResult.getStandardOutput()
    expect(stdout).toBe('out 1\nout 2')
  })

  test('getErrorOutput returns the error output as a string', () => {
    const stderr = jobResult.getErrorOutput()
    expect(stderr).toBe('error 1\nerror 2')
  })

  test('reset works', () => {
    jobResult.reset()
    expect(jobResult.getStandardOutput()).toBe('')
    expect(jobResult.getErrorOutput()).toBe('')
    expect(jobResult.schoolsLoaded).toBe(0)
    expect(jobResult.linesProcessed).toBe(0)
  })

  test('hasError', () => {
    const jb = new SchoolImportJobOutput()
    expect(jb.hasError()).toBe(false)
    jb.stderr.push('mock stderr line')
    expect(jb.hasError()).toBe(true)
  })
})

import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SchoolImportService } from './school-import.service'
import * as mssql from 'mssql'
import * as ConnectionPoolService from '../../sql/pool.service'
import { SchoolImportJobResult } from './SchoolImportJobResult'

const name = 'school-import'

const blobTrigger: AzureFunction = async function schoolImportIndex (context: Context, blob: any) {
  const start = performance.now()
  context.log(`${name} started for blob \n Name: ${context.bindingData.name} \n Blob Size: ${blob.length} Bytes`)
  let pool: mssql.ConnectionPool
  let jobResult = new SchoolImportJobResult()
  let standardOutput = ''
  let errorOutput = ''
  let svc: SchoolImportService

  // Setup
  try {
    pool = await ConnectionPoolService.getInstance(context.log)
    svc = new SchoolImportService(pool, jobResult, context.log)
  } catch (error) {
    context.log.error(`${name}: FATAL ERROR: ${error.message}`)
    return
  }

  // Import work
  try {
    await svc.updateJobStatusToProcessing()
    jobResult = await svc.process(blob)
    await pool.close()
    await svc.updateJobStatusToCompleted(jobResult)
  } catch (error) {
    context.log.error(`${name}: ERROR: ${error.message}`, error)
    await svc.updateJobStatusToFailed(jobResult, error)
  }

  standardOutput = jobResult.getStandardOutput()
  errorOutput = jobResult.getErrorOutput()
  context.bindings.schoolImportStderr = errorOutput
  context.bindings.schoolImportStdout = standardOutput

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${name}: ${timeStamp} processed ${jobResult.linesProcessed} schools, run took ${durationInMilliseconds} ms`)
}

export default blobTrigger

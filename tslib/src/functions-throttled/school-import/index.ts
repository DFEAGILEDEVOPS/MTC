import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SchoolImportService } from './school-import.service'
import type * as mssql from 'mssql'
import * as ConnectionPoolService from '../../sql/pool.service'
import { SchoolImportJobOutput } from './SchoolImportJobOutput'

const name = 'school-import'

const blobTrigger: AzureFunction = async function schoolImportIndex (context: Context, blob: any) {
  const start = performance.now()
  context.log(`${name} started for blob \n Name: ${context.bindingData.name} \n Blob Size: ${blob.length} Bytes`)
  let pool: mssql.ConnectionPool
  const jobResult = new SchoolImportJobOutput()
  let svc: SchoolImportService

  // Setup
  try {
    pool = await ConnectionPoolService.getInstance(context.log)
    svc = new SchoolImportService(pool, jobResult, context.log)
  } catch (error: any) {
    context.log.error(`${name}: FATAL ERROR: ${error.message}`)
    return
  }

  try {
    await svc.process(blob, context.bindingData.name)
  } catch (error: any) {
    context.log.error(`${name}: ERROR: ${error.message}`, error)
  }

  context.bindings.schoolImportStderr = jobResult.getErrorOutput()
  context.bindings.schoolImportStdout = jobResult.getStandardOutput()

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${name}: ${timeStamp} processed ${jobResult.linesProcessed} schools, run took ${durationInMilliseconds} ms`)
}

export default blobTrigger

import { app, output, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SchoolImportService } from './school-import.service'
import type * as mssql from 'mssql'
import * as ConnectionPoolService from '../../sql/pool.service'
import { SchoolImportJobOutput } from './SchoolImportJobOutput'

const functionName = 'school-import'

const blobStdOutOutput = output.storageBlob({
  path: 'school-import/{DateTime}-{name}-output-log.txt',
  connection: 'AZURE_STORAGE_CONNECTION_STRING'
})

const blobStdErrOutput = output.storageBlob({
  path: 'school-import/{DateTime}-{name}-error-log.txt',
  connection: 'AZURE_STORAGE_CONNECTION_STRING'
})

app.storageBlob(functionName, {
  handler: schoolImportIndex,
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  extraOutputs: [blobStdOutOutput, blobStdErrOutput],
  path: 'school-import/{name}.csv'
})

export async function schoolImportIndex (blobInputTrigger: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const blob = Buffer.from(blobInputTrigger as string, 'base64') // TODO copilot suggestion, not necessarily correct
  const blobName = context.triggerMetadata?.name?.toString() ?? ''
  context.log(`${functionName} started for blob \n Name: ${blobName} \n Blob Size: ${blob.length} Bytes`)
  let pool: mssql.ConnectionPool
  const jobResult = new SchoolImportJobOutput()
  let svc: SchoolImportService

  try {
    pool = await ConnectionPoolService.getInstance(context)
    svc = new SchoolImportService(pool, jobResult, context)
  } catch (error: any) {
    context.error(`${functionName}: FATAL ERROR: ${error.message}`)
    return
  }

  try {
    await svc.process(blob, blobName)
  } catch (error: any) {
    context.error(`${functionName}: ERROR: ${error.message}`, error)
  }
  context.extraOutputs.set(blobStdOutOutput, jobResult.getStandardOutput())
  context.extraOutputs.set(blobStdErrOutput, jobResult.getErrorOutput())

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} processed ${jobResult.linesProcessed} schools, run took ${durationInMilliseconds} ms`)
}

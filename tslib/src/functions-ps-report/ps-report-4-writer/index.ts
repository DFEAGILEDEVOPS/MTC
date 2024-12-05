import { app, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PsReportWriterService } from './ps-report-writer.service'
import { type PsReportStagingCompleteMessage } from '../common/ps-report-service-bus-messages'
import { JobDataService } from '../../services/data/job.data.service'
import { JobStatusCode } from '../../common/job-status-code'
let funcName = 'ps-report-4-writer'

app.serviceBusQueue(funcName, {
  queueName: 'ps-report-staging-complete',
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  handler: psReport4Writer
})

export async function psReport4Writer (triggerInput: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const incomingMessage = triggerInput as PsReportStagingCompleteMessage
  await bulkUpload(context, incomingMessage)
  const end = performance.now()
  const durationInMilliseconds = end - start
  context.log(`${funcName} complete:run took ${durationInMilliseconds} ms`)
}

async function bulkUpload (context: InvocationContext, incomingMessage: PsReportStagingCompleteMessage): Promise<void> {
  let dbTable = ''
  const service = new PsReportWriterService(context, context.invocationId)
  const jobDataService = new JobDataService()
  funcName = `${funcName}: ${context.invocationId}`
  try {
    context.trace(`${funcName}: creating new destination table in SQL Server`)
    dbTable = await service.createDestinationTableAndViewIfNotExists(incomingMessage)
    context.trace(`${funcName}: new table created ${dbTable}`)

    await service.prepareForUpload(incomingMessage.filename)
    context.log(`${funcName}: starting bulk upload from ${incomingMessage.filename} into table ${dbTable}`)
    await service.bulkUpload(incomingMessage, dbTable) // the container is *known* and is stored in the location path of the database 'EXTERNAL DATA SOURCE'.

    context.log(`${funcName}: bulk upload complete.`)
    await jobDataService.setJobComplete(incomingMessage.jobUuid,
      JobStatusCode.CompletedSuccessfully, 'bulk upload complete')

    await service.recreateView(dbTable)
  } catch (error: any) {
    if (error instanceof Error) {
      context.warn(`${funcName}: bulkUpload() failed: ${error.message}`)
      context.warn(`${funcName}: ${JSON.stringify(error)}`)
      await jobDataService.setJobComplete(incomingMessage.jobUuid,
        JobStatusCode.Failed, JSON.stringify(error))
    }
  }
}

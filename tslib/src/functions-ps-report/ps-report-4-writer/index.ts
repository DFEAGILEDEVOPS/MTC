import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PsReportWriterService } from './ps-report-writer.service'
import { type PsReportStagingCompleteMessage } from '../common/ps-report-service-bus-messages'
import { JobDataService } from '../../services/data/job.data.service'
import { JobStatusCode } from '../../common/job-status-code'
const funcName = 'ps-report-4-writer'

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, incomingMessage: PsReportStagingCompleteMessage): Promise<void> {
  const start = performance.now()
  await bulkUpload(context, incomingMessage)
  const end = performance.now()
  const durationInMilliseconds = end - start
  context.log(`${funcName} complete:run took ${durationInMilliseconds} ms`)
}

async function bulkUpload (context: Context, incomingMessage: PsReportStagingCompleteMessage): Promise<void> {
  let dbTable: string = ''
  const service = new PsReportWriterService(context.log)
  const jobDataService = new JobDataService()
  // Do we just delete the last upload and repoint the table alias.
  try {
    context.log.verbose(`${funcName}: creating new destination table in SQL Server`)
    dbTable = await service.createDestinationTableAndView(incomingMessage)
    context.log.verbose(`${funcName}: new table created ${dbTable}`)
    // context.log(`${funcName}: bulkUpload() uploading ${fileName}`)
    await service.prepareForUpload(incomingMessage.filename)
    context.log(`${funcName}: starting bulk upload from ${incomingMessage.filename} into table ${dbTable}`)
    await service.bulkUpload(incomingMessage, dbTable) // the container is *known* and is stored in the location path of the database 'EXTERNAL DATA SOURCE'.

    context.log(`${funcName}: bulk upload complete.`)
    await jobDataService.setJobComplete(incomingMessage.jobUuid,
      JobStatusCode.CompletedSuccessfully, 'bulk upload complete')
  } catch (error: any) {
    if (error instanceof Error) {
      context.log.warn(`${funcName}: bulkUpload() failed: ${error.message}`)
      context.log.warn(`${funcName}: ${JSON.stringify(error)}`)
      await jobDataService.setJobComplete(incomingMessage.jobUuid,
        JobStatusCode.Failed, JSON.stringify(error))
    }
    await service.cleanup(incomingMessage.filename)
  }
}

export default serviceBusQueueTrigger

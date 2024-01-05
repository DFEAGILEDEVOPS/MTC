import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { type PsReport4WriterMesssage } from './PsReport4WriterMessage'
import { PsReportWriterService } from './ps-report-writer.service'
const funcName = 'ps-report-4-writer'

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, incomingMessage: PsReport4WriterMesssage): Promise<void> {
  const start = performance.now()
  await bulkUpload(context, incomingMessage.fileName)
  const end = performance.now()
  const durationInMilliseconds = end - start
  context.log(`${funcName} complete:run took ${durationInMilliseconds} ms`)
}

async function bulkUpload (context: Context, fileName: string): Promise<void> {
  try {
    const service = new PsReportWriterService(context.log)
    context.log.verbose(`${funcName}: creating new destination table in SQL Server`)
    await service.createDestinationTableAndView()
    context.log.verbose(`${funcName}: new table created`)
    // context.log(`${funcName}: bulkUpload() uploading ${fileName}`)
    await service.prepareForUpload()
  } catch (error: any) {
    if (error instanceof Error) {
      context.log.warn(error.message)
      context.log.warn(JSON.stringify(error))
    }
    await cleanup()
  }
}

async function cleanup (): Promise<void> {
  // Remove CSV file
  // Remove ? new table (may not have been created)
  // Ensure the view table alias points to the last good PS report.
}

export default serviceBusQueueTrigger

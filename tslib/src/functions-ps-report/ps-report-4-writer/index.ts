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
  let dbTable: string = ''
  const service = new PsReportWriterService(context.log)
  // Do we just delete the last upload and repoint the table alias.
  try {
    context.log.verbose(`${funcName}: creating new destination table in SQL Server`)
    dbTable = await service.createDestinationTableAndView()
    context.log.verbose(`${funcName}: new table created ${dbTable}`)
    // context.log(`${funcName}: bulkUpload() uploading ${fileName}`)
    await service.prepareForUpload()
    context.log(`${funcName}: starting bulk upload from ${fileName} into table ${dbTable}`)
    await service.bulkUpload(fileName, dbTable) // the container is *known* and is stored in the location path of the database 'EXTERNAL DATA SOURCE'.
    context.log(`${funcName}: bulk upload complete.`)
  } catch (error: any) {
    if (error instanceof Error) {
      context.log.warn(`${funcName}: bulkUpload() failed: ${error.message}`)
      context.log.warn(`${funcName} : ` + JSON.stringify(error))
    }
    await service.cleanup(fileName, dbTable)
  }
}

export default serviceBusQueueTrigger

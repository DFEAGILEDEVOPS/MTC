import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SchoolListService } from './list-schools-service'

const functionName = 'ps-report-1-list-schools'

const timerTrigger: AzureFunction = async function (context: Context): Promise<void> {
  const start = performance.now()
  const meta = { processCount: 0, errorCount: 0 }
  try {
    const schoolListService = new SchoolListService(context.log)
    const messages = await schoolListService.getSchoolMessages()
    context.bindings.schoolMessages = messages
    meta.processCount = messages.length
  } catch (error) {
    context.log.error(`${functionName}: ERROR: ${error.message}`)
    throw error
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} processed ${meta.processCount} records, run took ${durationInMilliseconds} ms`)
}

export default timerTrigger

import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { ListSchoolsService } from './list-schools-service'
import { IFunctionTimer } from '../../azure/functions'
import { PsReportLogger } from '../common/ps-report-logger'
import { PsReportSource } from '../common/ps-report-log-entry'

const functionName = 'ps-report-1-list-schools'

const timerTrigger: AzureFunction = async function (context: Context, timer: IFunctionTimer): Promise<void> {
  if (timer.isPastDue) {
    // This function could potentially deliver a lot of work to do to the functions, and none of it is urgent. No surprises!
    context.log(`${functionName}: timer is past due, exiting.`)
    return
  }
  const logger = new PsReportLogger()
  const start = performance.now()
  const meta = { processCount: 0, errorCount: 0 }
  try {
    const schoolListService = new ListSchoolsService(context)
    const messages = await schoolListService.getSchoolMessages()
    context.bindings.schoolMessages = messages
    meta.processCount = messages.length
  } catch (error) {
    logger.error(error.message, PsReportSource.SchoolGenerator, context)
    throw error
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  logger.info(`${timeStamp} processed ${meta.processCount} records, run took ${durationInMilliseconds} ms`,
    PsReportSource.SchoolGenerator, context)
}

export default timerTrigger

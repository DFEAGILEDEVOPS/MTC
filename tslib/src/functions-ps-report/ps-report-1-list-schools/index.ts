import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { ListSchoolsService } from './list-schools-service'
import { PsReportLogger } from '../common/ps-report-logger'
import { PsReportSource } from '../common/ps-report-log-entry'
import { JobDataService } from '../../services/data/job.data.service'
import { JobStatusCode } from '../../common/job-status-code'

interface IncomingMessage {
  requestedBy: string
  dateTimeRequested: moment.Moment
  jobUuid: string
}

const serviceBusTrigger: AzureFunction = async function (context: Context, jobInfo: IncomingMessage): Promise<void> {
  const logger = new PsReportLogger(context, PsReportSource.SchoolGenerator)
  logger.verbose(`requested at ${jobInfo.dateTimeRequested.toISOString()} by ${jobInfo.requestedBy}`)
  const start = performance.now()
  const meta = { processCount: 0, errorCount: 0 }
  const jobDataService = new JobDataService()
  try {
    await jobDataService.setJobStarted(jobInfo.jobUuid)
    const schoolListService = new ListSchoolsService(logger)
    const messages = await schoolListService.getSchoolMessages()
    context.bindings.schoolMessages = messages
    meta.processCount = messages.length
    await jobDataService.setJobComplete(jobInfo.jobUuid,
      JobStatusCode.CompletedSuccessfully, `processed ${meta.processCount} records`)
  } catch (error) {
    logger.error(error.message)
    await jobDataService.setJobComplete(jobInfo.jobUuid, JobStatusCode.Failed,
      `processed ${meta.processCount} records`, error.message)
    throw error
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  logger.info(`processed ${meta.processCount} records, run took ${durationInMilliseconds} ms`)
}

export default serviceBusTrigger

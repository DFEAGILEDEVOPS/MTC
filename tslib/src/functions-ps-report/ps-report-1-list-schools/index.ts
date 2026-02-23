import { app, output, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { type ISchoolMessageSpecification, ListSchoolsService } from './list-schools-service'
import { PsReportLogger } from '../common/ps-report-logger'
import { PsReportSource } from '../common/ps-report-log-entry'
import { JobDataService } from '../../services/data/job.data.service'
import { JobStatusCode } from '../../common/job-status-code'
import moment from 'moment'
import type { PsReportStagingStartMessage, PsReportListSchoolsIncomingMessage } from '../common/ps-report-service-bus-messages'

const schoolMessagesQueue = output.serviceBusQueue({
  queueName: 'ps-report-schools',
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING'
})

const stagingStartQueue = output.serviceBusQueue({
  queueName: 'ps-report-staging-start',
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING'
})

app.serviceBusQueue('psReport1ListSchools', {
  queueName: 'ps-report-exec',
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  handler: psReport1ListSchools,
  extraOutputs: [schoolMessagesQueue, stagingStartQueue]
})

export async function psReport1ListSchools (triggerInput: unknown, context: InvocationContext): Promise<void> {
  const logger = new PsReportLogger(context, PsReportSource.SchoolGenerator)
  const jobInfo = triggerInput as PsReportListSchoolsIncomingMessage
  logger.trace(`requested at ${jobInfo.dateTimeRequested} by ${jobInfo.requestedBy}`)
  const start = performance.now()
  const meta = { processCount: 0, errorCount: 0 }
  const jobDataService = new JobDataService()
  try {
    // We need to store a filename for all the data to be written to during the staging process.
    const now = moment()
    const filename = `ps-report-staging-${now.format('YYYY-MM-DD-HHmm')}.csv`
    await jobDataService.setJobStarted(jobInfo.jobUuid, { meta: { filename } })
    const schoolListService = new ListSchoolsService(logger)
    const messageSpec: ISchoolMessageSpecification = {
      jobUuid: jobInfo.jobUuid,
      filename,
      urns: jobInfo.urns
    }
    const messages = await schoolListService.getSchoolMessages(messageSpec)
    context.extraOutputs.set(schoolMessagesQueue, messages)
    meta.processCount = messages.length

    // Send a message to start ps-report-3b-staging (the csv assembly)
    // service-bus queue = stagingStart
    const stagingStartMessage: PsReportStagingStartMessage = {
      startTime: new Date(),
      jobUuid: jobInfo.jobUuid,
      filename
    }
    context.extraOutputs.set(stagingStartQueue, stagingStartMessage)
    logger.info(`staging-start message sent: ${JSON.stringify(stagingStartMessage)}`)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    logger.error(errorMessage)
    await jobDataService.setJobComplete(jobInfo.jobUuid, JobStatusCode.Failed,
      `processed ${meta.processCount} records`, errorMessage)
    throw error
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  logger.info(`processed ${meta.processCount} records, run took ${durationInMilliseconds} ms`)
}

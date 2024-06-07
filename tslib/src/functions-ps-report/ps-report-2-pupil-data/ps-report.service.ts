import { type IPsReportDataService, PsReportDataService } from './ps-report.data.service'
import { type Pupil, type PupilResult, type School } from './models'
import { type ILogger } from '../../common/logger'
import { type IOutputBinding } from '.'
import type { PsReportSchoolFanOutMessage, PsReportStagingStartMessage } from '../common/ps-report-service-bus-messages'
import { ServiceBusQueueName } from '../../azure/service-bus-queue.names'
import config from '../../config'
import { IServiceBusQueueService, ServiceBusQueueService, IServiceBusQueueMessage } from '../../azure/service-bus.queue.service'

const logName = 'ps-report-2-pupil-data: PsReportService'

export class PsReportService {
  private readonly dataService: IPsReportDataService
  private readonly outputBinding: IOutputBinding
  private readonly logger: ILogger
  private readonly sbQueueService: IServiceBusQueueService

  constructor (outputBinding: IOutputBinding, logger: ILogger, dataService?: IPsReportDataService, sbQueueService?: IServiceBusQueueService) {
    this.outputBinding = outputBinding
    this.logger = logger
    this.dataService = dataService ?? new PsReportDataService(this.logger)
    this.sbQueueService = sbQueueService ?? new ServiceBusQueueService()
  }

  async process (incomingMessage: PsReportSchoolFanOutMessage): Promise<void> {
    if (config.Logging.DebugVerbosity > 1) {
      this.logger.verbose(`${logName}.process() called with ${JSON.stringify(incomingMessage)}`)
    }

    let pupils: readonly Pupil[]
    let school: School | undefined
    /**
     *  This function is triggered by an incoming service bus message.
     *
     */

    try {
      // Get pupil data for all pupils in a single school identified by the UUID in the incoming message.
      pupils = await this.dataService.getPupils(incomingMessage.uuid)
    } catch (error) {
      this.logger.error(`ERROR - unable to fetch pupils for school ${incomingMessage.uuid}`)
      throw error
    }

    for (let i = 0; i < pupils.length; i++) {
      const pupil = pupils[i]
      if (school === undefined) {
        school = await this.dataService.getSchool(pupil.schoolId)
      }
      try {
        const result: PupilResult = await this.dataService.getPupilData(pupil, school)
        const output: PupilResult = {
          answers: result.answers,
          check: result.check,
          checkConfig: result.checkConfig,
          checkForm: result.checkForm,
          device: result.device,
          events: result.events,
          pupil: result.pupil,
          school: result.school
        }
        this.outputBinding.psReportPupilMessage.push(output)
      } catch (error: any) {
        // Ignore the error on the particular pupil and carry on so it reports on the rest of the school
        this.logger.error(`${logName}: ERROR: Failed to retrieve pupil data for pupil ${pupil.slug} in school ${incomingMessage.uuid}
          Error was ${error.message}`)
      }
    }

    const shouldStartStaging = await this.shouldStartStaging(incomingMessage)
    if (shouldStartStaging) {
      this.logger.verbose(`${logName}: sending staging start message`)
      // send a message to the ps-report-3b-staging function to start up and start creating the csv file in blob storage.
      const msg: PsReportStagingStartMessage = {
        startTime: new Date(),
        jobUuid: incomingMessage.jobUuid,
        filename: incomingMessage.filename
      }
      await this.sendStagingStartMessage(msg)
    }
  }

  /**
   * Determine if the staging start message should be sent to the `ps-report-3-staging` function
   * which is listening for message on the sb queue `ps-report-staging-start`
   *
   * By default it will send the message when there are 100 or less messages on the queue.  This
   * has proven problematic in live as apparently it failed to detect when only 1 message was on the
   * queue.
   *
   * Similar logic works for the test environment where ps reports will be generated for a single school.
   *
   * The ps-report-3-staging function will then start assembling the CSV file for bulk upload.
   *
   */
  private async shouldStartStaging (incomingMessage: PsReportSchoolFanOutMessage): Promise<boolean> {
    // See how many message are left on the "schools" sb queue
    const msgCount = await this.sbQueueService.getActiveMessageCount(ServiceBusQueueName.psReportSchools)
    // Look for the last message on the queue.  This _could_ also match the first message on the queue if a school had a single pupil in Y4.
    if (msgCount <= 100) { // TODO: JMS:  make this into config
      this.logger.verbose(`shouldStartStaging() returning true as there are ${msgCount} messages left from a total of ${incomingMessage.totalNumberOfSchools}`)
      return true
    }
    return false
  }

  private async sendStagingStartMessage (msg: PsReportStagingStartMessage): Promise<void> {
     const message: IServiceBusQueueMessage = {
        body: msg,
        messageId: msg.jobUuid, // for duplicate detection
        contentType: 'application/json'
      }
      await this.sbQueueService.dispatch(message, ServiceBusQueueName.psReportStagingStart)
  }
}

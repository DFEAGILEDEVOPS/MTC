import { type IPsReportDataService, PsReportDataService } from './ps-report.data.service'
import { type Pupil, type PupilResult, type School } from './models'
import { type ILogger } from '../../common/logger'
import { type IOutputBinding } from '.'
import type { PsReportSchoolFanOutMessage, PsReportStagingStartMessage } from '../common/ps-report-service-bus-messages'
import { ServiceBusAdministrationClient, ServiceBusClient, type ServiceBusMessage } from '@azure/service-bus'
import config from '../../config'

const logName = 'ps-report-2-pupil-data: PsReportService'
const outputQueueName = 'ps-report-staging-start'

export class PsReportService {
  private readonly dataService: IPsReportDataService
  private readonly outputBinding: IOutputBinding
  private readonly logger: ILogger
  private readonly serviceBusAdministrationClient: ServiceBusAdministrationClient

  constructor (outputBinding: IOutputBinding, logger: ILogger, dataService?: IPsReportDataService) {
    this.outputBinding = outputBinding
    this.logger = logger
    this.dataService = dataService ?? new PsReportDataService(this.logger)
    if (config.ServiceBus.ConnectionString === undefined || config.ServiceBus.ConnectionString === null) {
      throw new Error('Unable to connect to service bus.  Please check the config.')
    }
    this.serviceBusAdministrationClient = new ServiceBusAdministrationClient(config.ServiceBus.ConnectionString)
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
   * By default it will send the message when there are 5% of the totalMessages remaining. E.g.
   * 5% of 16,908 is 845.4 which will be rounded up to 846.
   *
   * In local environments, 5% of 5 is 0.25 and ceil() will round that up to 1.
   *
   * Similar logic works for the test environment where ps reports will be generated for a single school.
   *
   * The ps-report-3-staging function will then start assembling the CSV file for bulk upload.
   */
  private async shouldStartStaging (incomingMessage: PsReportSchoolFanOutMessage): Promise<boolean> {
    // See how many message are left on the "schools" sb queue
    const inputQueueName = 'ps-report-schools'
    const queueRuntimeProperties = await this.serviceBusAdministrationClient.getQueueRuntimeProperties(inputQueueName)

    /**
     * The number of messages left of the queue at which point we want to tell the staging-service to start running.
     */

    // const targetLowMessageCount = Math.ceil((config.PsReport.ListSchools.PercentLeftToStartStaging / 100) * incomingMessage.totalNumberOfSchools)
    const msgCount = queueRuntimeProperties.totalMessageCount

    if (msgCount === undefined || msgCount === null) {
      return false
    }

    // Look for a low message count.  Ideally, this will be the last message after all the messages have been processed, but a
    // low message count is also possible if the first school has only a few pupils, so it's always possible this will trigger
    // at the beginning.
    if (msgCount <= 1) {
      this.logger.verbose(`shouldStartStaging() returning true as there are ${msgCount} messages left from a total of ${incomingMessage.totalNumberOfSchools} and the threshold is ${config.PsReport.ListSchools.PercentLeftToStartStaging}%`)
      return true
    }

    return false
  }

  private async sendStagingStartMessage (msg: PsReportStagingStartMessage): Promise<void> {
    if (config.ServiceBus.ConnectionString === undefined) {
      throw new Error('Can\'t connect to service bus.  Missing ConnectionString.')
    }
    const sbClient = new ServiceBusClient(config.ServiceBus.ConnectionString)
    const sender = sbClient.createSender(outputQueueName)
    try {
      const message: ServiceBusMessage = {
        body: msg,
        messageId: msg.jobUuid, // for duplicate detection
        contentType: 'application/json'
      }
      await sender.sendMessages(message)
      await sender.close()
      await sbClient.close()
    } finally {
      await sbClient.close()
    }
  }
}

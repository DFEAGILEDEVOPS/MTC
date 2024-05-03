import { type IPsReportDataService, PsReportDataService } from './ps-report.data.service'
import { type Pupil, type PupilResult, type School } from './models'
import { type ILogger } from '../../common/logger'
import { type IMultipleOutputBinding } from '.'
import type { PsReportSchoolFanOutMessage, PsReportStagingStartMessage } from '../common/ps-report-service-bus-messages'

/**
 * pupilCounter: count the number of pupils processed across multiple invocations.  This is key, as it allows the end of pupil data to be detected
 *               which sends off a message to start the ps-report-3b-transformer.  The transform process is in between these two processes, but it
 *               should already have finished quite a bit of work, which is enough for the csv assembler to work on.
 */
let schoolCounter = 0
const logName = 'ps-report-2-pupil-data: PsReportService'

export class PsReportService {
  private readonly dataService: IPsReportDataService
  private readonly outputBinding: IMultipleOutputBinding
  private readonly logger: ILogger

  constructor (outputBinding: IMultipleOutputBinding, logger: ILogger, dataService?: IPsReportDataService) {
    this.outputBinding = outputBinding
    this.logger = logger
    this.dataService = dataService ?? new PsReportDataService(this.logger)
  }

  async process (incomingMessage: PsReportSchoolFanOutMessage): Promise<void> {
    let pupils: readonly Pupil[]
    let school: School | undefined
    schoolCounter += 1
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

    if (this.isLastSchool(incomingMessage)) {
      this.logger.verbose(`${logName}: school ${schoolCounter} seen out of ${incomingMessage.totalNumberOfSchools}`)
      // Reset ready for the next run.
      this.resetSchoolCounter()
      // send a message to the ps-report-3b-staging function to start up and start creating the csv file in blob storage.
      const msg: PsReportStagingStartMessage = {
        startTime: new Date(),
        jobUuid: incomingMessage.jobUuid,
        filename: incomingMessage.filename
      }
      this.outputBinding.psReportStagingStart.push(msg)
    }
  }

  private isLastSchool (incomingMessage: PsReportSchoolFanOutMessage): boolean {
    if (schoolCounter >= incomingMessage.totalNumberOfSchools) {
      return true
    }
    return false
  }

  private resetSchoolCounter (): void {
    schoolCounter = 0
  }
}

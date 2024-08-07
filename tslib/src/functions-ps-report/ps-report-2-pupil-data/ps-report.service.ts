import { type IPsReportDataService, PsReportDataService } from './ps-report.data.service'
import { type Pupil, type PupilResult, type School } from './pupil-data.models'
import { type ILogger } from '../../common/logger'
import type { PsReportSchoolFanOutMessage } from '../common/ps-report-service-bus-messages'
import config from '../../config'
import { ReportLine } from './report-line.class'
import { type IPsychometricReportLine } from './transformer-models'

const logName = 'ps-report-2-pupil-data: PsReportService'

export interface IPsReportServiceOutput {
  psReportExportOutput: IPsychometricReportLine[]
}
export class PsReportService {
  private readonly dataService: IPsReportDataService
  private readonly logger: ILogger

  constructor (logger: ILogger, dataService?: IPsReportDataService) {
    this.logger = logger
    this.dataService = dataService ?? new PsReportDataService(this.logger)
  }

  async process (incomingMessage: PsReportSchoolFanOutMessage): Promise<IPsReportServiceOutput> {
    if (config.Logging.DebugVerbosity > 1) {
      this.logger.trace(`${logName}.process() called with ${JSON.stringify(incomingMessage)}`)
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
    const output: IPsReportServiceOutput = {
      psReportExportOutput: []
    }
    for (let i = 0; i < pupils.length; i++) {
      const pupil = pupils[i]
      if (school === undefined) {
        school = await this.dataService.getSchool(pupil.schoolId)
      }
      try {
        const result: PupilResult = await this.dataService.getPupilData(pupil, school)
        const pupilResult: PupilResult = {
          answers: result.answers,
          check: result.check,
          checkConfig: result.checkConfig,
          checkForm: result.checkForm,
          device: result.device,
          events: result.events,
          pupil: result.pupil,
          school: result.school
        }

        // Now we have the pupil data we can transform it into the report format
        const reportLine = new ReportLine(pupilResult.answers, pupilResult.check, pupilResult.checkConfig, pupilResult.checkForm, pupilResult.device, pupilResult.events, pupilResult.pupil, pupilResult.school)
        const outputData = reportLine.transform()
        output.psReportExportOutput.push(outputData)
        // Send the transformed pupil data onto the ps-report-export queue using the output bindings.
      } catch (error: any) {
        // Ignore the error on the particular pupil and carry on so it reports on the rest of the school
        this.logger.error(`${logName}: ERROR: Failed to retrieve pupil data for pupil ${pupil.slug} in school ${incomingMessage.uuid}
          Error was ${error.message}`)
      }
    }
    return output
  }
}

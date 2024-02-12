import { type IPsReportDataService, PsReportDataService } from './ps-report.data.service'
import { type Pupil, type PupilResult, type School } from './models'
import { type ILogger } from '../../common/logger'
import { type PsReportStagingStartMessage } from '../ps-report-3b-stage-csv-file/interfaces'
import { type IMultipleOutputBinding } from '.'

let pupilCounter = 0
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

  async process (schoolUuid: string): Promise<void> {
    let pupils: readonly Pupil[]
    let school: School | undefined
    let totalPupilCount: number | undefined
    try {
      pupils = await this.dataService.getPupils(schoolUuid)
    } catch (error) {
      this.logger.error(`ERROR - unable to fetch pupils for school ${schoolUuid}`)
      throw error
    }
    try {
      totalPupilCount = await this.dataService.getTotalPupilCount()
    } catch (error: any) {
      this.logger.error(`ERROR - unable to determine total pupil count: ${error?.message}`)
    }
    for (let i = 0; i < pupils.length; i++) {
      const pupil = pupils[i]
      if (school === undefined) {
        school = await this.dataService.getSchool(pupil.schoolId)
      }
      try {
        pupilCounter += 1
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
        if (pupilCounter === totalPupilCount) {
          this.logger.verbose(`${logName}: pupil ${pupilCounter} seen out of ${totalPupilCount}`)
          // reset conter
          pupilCounter = 0
          // send a message to the ps-report-3b-staging function to start up and start creating the csv file in blob storage.
          const msg: PsReportStagingStartMessage = {
            startTime: new Date(),
            totalNumberOfPupils: totalPupilCount
          }
          this.outputBinding.psReportStagingStart.push(msg)
        }
      } catch (error: any) {
        // Ignore the error on the particular pupil and carry on so it reports on the rest of the school
        this.logger.error(`${logName}: ERROR: Failed to retrieve pupil data for pupil ${pupil.slug} in school ${schoolUuid}
          Error was ${error.message}`)
      }
    }
  }
}

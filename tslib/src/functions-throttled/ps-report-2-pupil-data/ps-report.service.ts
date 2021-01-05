import { ConsoleLogger, ILogger } from '../../common/logger'
import { IPsReportDataService, PsReportDataService } from './ps-report.data.service'
import { Pupil, PupilResult, School } from './models'
const functionName = 'ps-report-2-pupil-data'

export class PsReportService {
  private readonly logger: ILogger
  private readonly dataService: IPsReportDataService
  private readonly outputBinding: PupilResult[]

  constructor (outputBinding: any[], logger: ILogger, dataService?: IPsReportDataService) {
    this.outputBinding = outputBinding
    this.logger = logger ?? new ConsoleLogger()
    this.dataService = dataService ?? new PsReportDataService(this.logger)
  }

  async process (schoolUuid: string): Promise<void> {
    let pupils: Pupil[]
    let school: School | undefined
    try {
      pupils = await this.dataService.getPupils(schoolUuid)
    } catch (error) {
      this.logger.error(`${functionName} ERROR - unable to fetch pupils for school ${schoolUuid}`)
      throw error
    }
    for (let i = 0; i < pupils.length; i++) {
      const pupil = pupils[i]
      if (school === undefined) {
        school = await this.dataService.getSchool(pupil.schoolId)
      }
      try {
        const result: PupilResult = await this.dataService.getPupilData(pupil, school)
        // this.logger.verbose(`${functionName}: pupil result retrieved: ${JSON.stringify(result, null, 4)}`)
        this.outputBinding.push(result)
      } catch (error) {
        // Ignore the error on the particular pupil and carry on so it reports on the rest of the school
        this.logger.error(`${functionName} ERROR: Failed to retrieve pupil data for pupil ${pupil.slug} in school ${schoolUuid}
        Error was ${error.message}`)
      }
    }
  }
}

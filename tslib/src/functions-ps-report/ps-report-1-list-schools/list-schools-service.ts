import { type ILogger } from '../../common/logger'
import { type ISqlService, SqlService } from '../../sql/sql.service'
import { type PsReportSchoolFanOutMessage } from '../common/ps-report-service-bus-messages'

export interface School {
  id: number
  uuid: string
  name: string
}

export interface IListSchoolsService {
  getSchoolMessages (jobUuid: string, filename: string): Promise<PsReportSchoolFanOutMessage[]>
}

export class ListSchoolsService implements IListSchoolsService {
  private readonly logger: ILogger
  private readonly sqlService: ISqlService

  constructor (logger: ILogger, sqlService?: ISqlService) {
    this.logger = logger
    this.sqlService = sqlService ?? new SqlService()
  }

  private async getSchools (): Promise<School[]> {
    // 54227: Do not include test schools in the PS Report
    const sql = 'SELECT id, name, urlSlug as uuid from mtc_admin.school WHERE isTestSchool = 0'
    return this.sqlService.query(sql)
  }

  public async getSchoolMessages (jobUuid: string, filename: string): Promise<PsReportSchoolFanOutMessage[]> {
    this.logger.verbose('ListSchoolsService called - retrieving all schools')
    const schools = await this.getSchools()
    const schoolMessages: PsReportSchoolFanOutMessage[] = schools.map(school => {
      return {
        uuid: school.uuid,
        name: school.name,
        jobUuid,
        filename
      }
    })
    this.logger.info(`getSchoolMessages() retrieved ${schoolMessages.length} schools`)
    return schoolMessages
  }
}

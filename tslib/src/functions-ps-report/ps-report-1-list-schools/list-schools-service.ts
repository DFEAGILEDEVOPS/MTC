import { ISqlService, SqlService } from '../../sql/sql.service'
import { IPsReportLogger } from '../common/ps-report-logger'

export interface School {
  id: number
  uuid: string
  name: string
}

export interface SchoolMessage {
  uuid: string
  name: string
}

export interface IListSchoolsService {
  getSchoolMessages (): Promise<SchoolMessage[]>
}

export class ListSchoolsService implements IListSchoolsService {
  private readonly logger: IPsReportLogger
  private readonly sqlService: ISqlService

  constructor (logger: IPsReportLogger, sqlService?: ISqlService) {
    this.logger = logger
    this.sqlService = sqlService ?? new SqlService()
  }

  private async getSchools (): Promise<School[]> {
    const sql = 'SELECT id, name, urlSlug as uuid from mtc_admin.school'
    return this.sqlService.query(sql)
  }

  public async getSchoolMessages (): Promise<SchoolMessage[]> {
    this.logger.verbose('ListSchoolsService called - retrieving all schools')
    const schools = await this.getSchools()
    const schoolMessages: SchoolMessage[] = schools.map(school => {
      return {
        uuid: school.uuid,
        name: school.name
      }
    })
    this.logger.info(`getSchoolMessages() retrieved ${schoolMessages.length} schools`)
    return schoolMessages
  }
}

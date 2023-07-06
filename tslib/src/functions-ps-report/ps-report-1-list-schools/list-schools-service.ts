import { type ILogger } from '../../common/logger'
import { type ISqlService, SqlService } from '../../sql/sql.service'

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

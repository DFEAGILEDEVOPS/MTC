import { IContextLike } from '../../common/ContextLike'
import { ISqlService, SqlService } from '../../sql/sql.service'

const functionName = 'ps-report-1-list-schools'

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
  private readonly context: IContextLike
  private readonly sqlService: ISqlService

  constructor (context: IContextLike, sqlService?: ISqlService) {
    this.context = context
    this.sqlService = sqlService ?? new SqlService()
  }

  private async getSchools (): Promise<School[]> {
    const sql = 'SELECT id, name, urlSlug as uuid from mtc_admin.school'
    return this.sqlService.query(sql)
  }

  public async getSchoolMessages (): Promise<SchoolMessage[]> {
    this.context.log.verbose(`${functionName}: ListSchoolsService called - retrieving all schools`)
    // await this.psReportLogger.log('ListSchoolsService called - retrieving all schools', PsReportSource.SchoolGenerator)
    const schools = await this.getSchools()
    const schoolMessages: SchoolMessage[] = schools.map(school => {
      return {
        uuid: school.uuid,
        name: school.name
      }
    })
    this.context.log.info(`${functionName}: getSchoolMessages() retrieved ${schoolMessages.length} schools`)
    return schoolMessages
  }
}

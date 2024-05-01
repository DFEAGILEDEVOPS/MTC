import { TYPES } from 'mssql'
import { type ILogger } from '../../common/logger'
import { type ISqlService, SqlService } from '../../sql/sql.service'
import { type PsReportSchoolFanOutMessage } from '../common/ps-report-service-bus-messages'

export interface School {
  id: number
  uuid: string
  name: string
}

export interface IListSchoolsService {
  getSchoolMessages (messageSpecification: ISchoolMessageSpecification): Promise<PsReportSchoolFanOutMessage[]>
}

export interface ISchoolMessageSpecification {
  jobUuid: string
  filename: string
  urns?: number[]
}

export class ListSchoolsService implements IListSchoolsService {
  private readonly logger: ILogger
  private readonly sqlService: ISqlService

  constructor (logger: ILogger, sqlService?: ISqlService) {
    this.logger = logger
    this.sqlService = sqlService ?? new SqlService()
  }

  private async getSchools (urns?: number[]): Promise<School[]> {
    // 54227: Do not include test schools in the PS Report
    let sql = 'SELECT id, name, urlSlug as uuid from mtc_admin.school WHERE isTestSchool = 0'
    const params = new Array<any>()
    const paramIds = new Array<string>()
    if (urns !== undefined && urns?.length > 0) {
      const paramPrefix = 'urn'
      urns.forEach((urn, index) => {
        params.push({ name: `${paramPrefix}${index}`, type: TYPES.Int, value: urn })
        paramIds.push(`@${paramPrefix}${index}`)
      })
      sql += ` AND urn IN (${paramIds.join(', ')})`
    }
    return this.sqlService.query(sql, params)
  }

  public async getSchoolMessages (specification: ISchoolMessageSpecification): Promise<PsReportSchoolFanOutMessage[]> {
    this.logger.verbose('ListSchoolsService called - retrieving all schools')
    const schools = await this.getSchools(specification.urns)
    const schoolMessages: PsReportSchoolFanOutMessage[] = schools.map(school => {
      return {
        uuid: school.uuid,
        name: school.name,
        jobUuid: specification.jobUuid,
        filename: specification.filename,
        totalNumberOfSchools: schools.length
      }
    })
    this.logger.info(`getSchoolMessages() retrieved ${schoolMessages.length} schools`)
    return schoolMessages
  }
}

import { ISqlService, SqlService } from '../../sql/sql.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { TYPES } from 'mssql'
import { PupilResult, Pupil, School, CheckConfig, CheckConfigOrNull, nullOrUndef } from './models'
const functionName = 'ps-report-2-pupil-data'

export interface IPsReportDataService {
  getPupils (schoolUuid: string): Promise<Pupil[]>

  getPupilData (pupil: Pupil): Promise<PupilResult>
}

export class PsReportDataService {
  private readonly logger: ILogger
  private readonly sqlService: ISqlService

  constructor (logger?: ILogger, sqlService?: ISqlService) {
    this.logger = logger ?? new ConsoleLogger()
    this.sqlService = sqlService ?? new SqlService()
  }

  public async getPupils (schoolUuid: string): Promise<Pupil[]> {
    this.logger.verbose(`${functionName}: getPupils() called for school ${schoolUuid}`)
    const sql = `
        SELECT TOP(10)
            p.id,
            p.foreName,
            p.lastName,
            p.upn,
            p.gender,
            p.dateOfBirth,
            p.attendanceId,
            p.checkComplete,
            p.currentCheckId,
            p.school_id,
            ac.reason as notTakingCheckReason
          FROM mtc_admin.pupil p
               JOIN      mtc_admin.school s ON (p.school_id = s.id)
               LEFT JOIN mtc_admin.attendanceCode ac ON (p.attendanceId = ac.id)
         WHERE s.urlSlug = @slug
    `
    const params = [
      { name: 'slug', value: schoolUuid, type: TYPES.UniqueIdentifier }
    ]

    interface dbPupil {
      attendanceId: number
      checkComplete: boolean
      currentCheckId: number | nullOrUndef
      dateOfBirth: moment.Moment
      foreName: string
      gender: 'M' | 'F'
      id: number
      lastName: string
      notTakingCheckReason: string | nullOrUndef
      school_id: number
      urlSlug: string
      upn: string
    }

    const data = await this.sqlService.query(sql, params)
    const pupils: Pupil[] = data.map((data: dbPupil) => {
      const pupil: Pupil = {
        attendanceId: data.attendanceId,
        checkComplete: data.checkComplete,
        currentCheckId: data.currentCheckId ?? undefined,
        dateOfBirth: data.dateOfBirth,
        forename: data.foreName,
        gender: data.gender,
        id: data.id,
        lastname: data.lastName,
        notTakingCheckReason: data.notTakingCheckReason ?? undefined,
        schoolId: data.school_id,
        slug: data.urlSlug,
        upn: data.upn
      }
      return pupil
    })
    return pupils
  }

  private async getSchool (schoolId: number): Promise<School> {
    const sql = `
        SELECT estabCode, id, leaCode, name, urlSlug, urn
          FROM mtc_admin.school
         WHERE school.id = @schoolId
    `
    const res = await this.sqlService.query(sql, [{ name: 'schoolId', value: schoolId, type: TYPES.Int }])
    const data = res[0]
    const school: School = {
      estabCode: data.estabCode,
      id: data.id,
      laCode: data.laCode,
      name: data.name,
      slug: data.urlSlug,
      urn: data.urn
    }
    return school
  }

  private async getCheckConfig (currentCheckId: number | undefined): Promise<CheckConfig | null> {
    if (currentCheckId === undefined) {
      return null
    }
    const sql = `
        SELECT payload
          FROM mtc_admin.checkConfig
         WHERE check_id = @checkId
    `
    const res = await this.sqlService.query(sql, [{ name: 'checkId', value: currentCheckId, type: TYPES.Int }])
    const data = res[0]
    const config: CheckConfig = JSON.parse(data.payload)
    return config
  }

  public async getPupilData (pupil: Pupil): Promise<PupilResult> {
    const promises: [Promise<School>, Promise<CheckConfigOrNull>] = [
      this.getSchool(pupil.schoolId),
      this.getCheckConfig(pupil.currentCheckId)
    ]
    const [school, checkConfig] = await Promise.all(promises)
    return {
      pupil,
      school,
      checkConfig: checkConfig
    }
  }
}

import { SqlService } from '../../sql/sql.service'
import { TYPES } from 'mssql'

export interface IPreparedCheckSyncDataService {
  getActiveCheckReferencesByPupilUuid (pupilUUID: string): Promise<IActiveCheckReference[]>
  getAccessArrangementsCodesByIds (aaIds: Array<number>): Promise<Array<string>>
  getAccessArrangementsByCheckCode (checkCode: string): Promise<Array<any>>
}

export class PreparedCheckSyncDataService implements IPreparedCheckSyncDataService {
  private static aaCodes = new Array<IAccessArrangementCode>()
  private sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async getActiveCheckReferencesByPupilUuid (pupilUUID: string): Promise<IActiveCheckReference[]> {
    // TODO remove when static connection pool is in master
    await this.sqlService.init()
    const results = await Promise.all([
      this.sqlService.query(`
      SELECT TOP 1 chk.checkCode, pn.val as pupilPin, s.pin as schoolPin
        FROM [mtc_admin].[check] chk
      INNER JOIN [mtc_admin].checkStatus cs
        ON cs.id = chk.checkStatus_id
      INNER JOIN mtc_admin.pupil p
        ON p.id = chk.pupil_id
      INNER JOIN [mtc_admin].school s
        ON s.id = p.school_id
      INNER JOIN [mtc_admin].checkPin cp
        ON chk.id = cp.check_id
      INNER JOIN [mtc_admin].pin pn
        ON cp.pin_id = pn.id
      WHERE chk.isLiveCheck = 1
        AND cs.code NOT IN ('CMP', 'EXP', 'NTR')
        AND p.urlSlug='${pupilUUID}'
      ORDER BY chk.createdAt DESC`),
      this.sqlService.query(`
      SELECT TOP 1 chk.checkCode, pn.val as pupilPin, s.pin as schoolPin
        FROM [mtc_admin].[check] chk
      INNER JOIN [mtc_admin].checkStatus cs
        ON cs.id = chk.checkStatus_id
      INNER JOIN mtc_admin.pupil p
        ON p.id = chk.pupil_id
      INNER JOIN [mtc_admin].school s
        ON s.id = p.school_id
      INNER JOIN [mtc_admin].checkPin cp
        ON chk.id = cp.check_id
      INNER JOIN [mtc_admin].pin pn
        ON cp.pin_id = pn.id
      WHERE chk.isLiveCheck = 0
        AND cs.code != 'EXP'
        AND p.urlSlug='${pupilUUID}'
      ORDER BY chk.createdAt DESC`)
    ])
    const result1 = results[0]
    const result2 = results[1]
    const refs = new Array<IActiveCheckReference>()
    console.log('result1...')
    console.dir(result1)
    console.log('result2...')
    console.dir(result2)
    if (result1.length === 1) {
      refs.push(result1[0])
    }
    if (result2.length === 1) {
      refs.push(result2[0])
    }
    return refs
  }

  async getAccessArrangementsCodesByIds (aaIds: Array<number>): Promise<string[]> {
    if (PreparedCheckSyncDataService.aaCodes.length === 0) {
      await this.initCodes()
    }
    return Object.keys(PreparedCheckSyncDataService.aaCodes).filter((code: any) =>
      PreparedCheckSyncDataService.aaCodes[code] && aaIds.includes(PreparedCheckSyncDataService.aaCodes[code].id)
    )
  }

  async getAccessArrangementsByCheckCode (checkCode: string): Promise<Array<any>> {
    const sql = `
    SELECT pAA.*, pfs.code AS pupilFontSizeCode, pcc.code AS pupilColourContrastCode
    FROM [mtc_admin].[pupilAccessArrangements] pAA
    LEFT OUTER JOIN [mtc_admin].[pupilFontSizes] pfs
      ON pAA.pupilFontSizes_id = pfs.id
    LEFT OUTER JOIN [mtc_admin].[pupilColourContrasts] pcc
      ON pAA.pupilColourContrasts_id = pcc.id
    INNER JOIN [mtc_admin].[pupil] p
      ON pAA.pupil_id = p.id
    INNER JOIN [mtc_admin].[check] chk
      ON p.id = chk.pupil_id
    WHERE chk.checkCode = @checkCode`

    const params = [
      {
        name: 'checkCode',
        value: checkCode,
        type: TYPES.UniqueIdentifier
      }
    ]
    return this.sqlService.query(sql, params)
  }

  private async initCodes (): Promise<void> {
    const sql = 'SELECT id, code FROM [mtc_admin].[accessArrangements]'
    const codes = await this.sqlService.query(sql)
    codes.map((aa: any) => {
      PreparedCheckSyncDataService.aaCodes[aa.code] = { id: aa.id, code: aa.code }
    })
  }
}

interface IAccessArrangementCode {
  id: number
  code: string
}

export interface IActiveCheckReference {
  checkCode: string
  schoolPin: string
  pupilPin: string
}

import { SqlService } from '../../sql/sql.service'
import { TYPES } from 'mssql'

export interface IPreparedCheckSyncDataService {
  getActiveCheckReferencesByPupilUuid (pupilUUID: string): Promise<IActiveCheckReference[]>
  getAccessArrangementsByCheckCode (checkCode: string): Promise<Array<any>>
}

export class PreparedCheckSyncDataService implements IPreparedCheckSyncDataService {
  private sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  async getActiveCheckReferencesByPupilUuid (pupilUUID: string): Promise<IActiveCheckReference[]> {
    const liveCheckSql = `
        SELECT chk.checkCode, pn.val as pupilPin, s.pin as schoolPin
          FROM [mtc_admin].pupil p
               INNER JOIN [mtc_admin].[check] chk ON (p.currentCheckId = chk.id)
               INNER JOIN [mtc_admin].school s ON (s.id = p.school_id)
               INNER JOIN [mtc_admin].checkPin cp ON (chk.id = cp.check_id)
               INNER JOIN [mtc_admin].pin pn ON (cp.pin_id = pn.id)
         WHERE chk.isLiveCheck = 1
         -- Is there any point in updating checks that have been collected?
           AND chk.received = 0
         -- Exclude expired checks.  If the is deallocated the check will not be included due to the inner join.
           AND cp.pinExpiresAt > GETUTCDATE() -- pin expiry in the future
           AND p.urlSlug = @pupilUUID`

    const tioCheckSql = `
        SELECT chk.checkCode, pn.val as pupilPin, s.pin as schoolPin
          FROM [mtc_admin].[check] chk
               INNER JOIN mtc_admin.pupil p ON p.id = chk.pupil_id
               INNER JOIN [mtc_admin].school s ON s.id = p.school_id
               INNER JOIN [mtc_admin].checkPin cp ON chk.id = cp.check_id
               INNER JOIN [mtc_admin].pin pn ON cp.pin_id = pn.id
         WHERE chk.isLiveCheck = 0
           -- Ensure the pin is valid  If the pin is deallocated the check will not be included due to the inner join.
           AND cp.pinExpiresAt > GETUTCDATE() -- pin expiry in the future
           AND p.urlSlug = @pupilUUID`

    const pupilUuidParam = {
      name: 'pupilUUID',
      type: TYPES.NVarChar,
      value: pupilUUID
    }
    const results = await Promise.all([
      this.sqlService.query(liveCheckSql, [pupilUuidParam]),
      this.sqlService.query(tioCheckSql, [pupilUuidParam])
    ])
    const result1 = results[0]
    const result2 = results[1]
    const refs = new Array<IActiveCheckReference>()
    if (result1.length === 1) {
      refs.push(result1[0])
    }
    if (result2.length === 1) {
      refs.push(result2[0])
    }
    return refs
  }

  async getAccessArrangementsByCheckCode (checkCode: string): Promise<Array<any>> {
    const sql = `
    SELECT pAA.accessArrangements_id,
    pfs.code AS pupilFontSizeCode, pcc.code AS pupilColourContrastCode
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
}

export interface IActiveCheckReference {
  checkCode: string
  schoolPin: string
  pupilPin: string
}

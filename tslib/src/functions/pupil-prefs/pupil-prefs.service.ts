import { SqlService, ITransactionRequest } from '../../sql/sql.service'
import { TYPES } from 'mssql'
import { IPupilPrefsFunctionBindings } from './IPupilPrefsFunctionBindings'
import { RedisService } from '../../caching/redis-service'

export class PupilPrefsService {

  private dataService: IPupilPrefsDataService

  constructor (pupilPrefsDataService?: IPupilPrefsDataService) {
    if (pupilPrefsDataService === undefined) {
      pupilPrefsDataService = new PupilPrefsDataService()
    }
    this.dataService = pupilPrefsDataService
  }

  async update (preferenceUpdate: IPupilPreferenceUpdate, functionBindings: IPupilPrefsFunctionBindings): Promise<void> {

    const dataUpdates = new Array<IPupilPreferenceDataUpdate>()

    if (preferenceUpdate.preferences.colourContrastCode) {
      const colourContrastDataUpdate: IPupilPreferenceDataUpdate = {
        aaCode: 'CCT',
        checkCode: preferenceUpdate.checkCode,
        prefField: 'pupilColourContrasts_id',
        prefTable: '[pupilColourContrasts]',
        prefCode: preferenceUpdate.preferences.colourContrastCode
      }
      dataUpdates.push(colourContrastDataUpdate)
    }

    if (preferenceUpdate.preferences.fontSizeCode) {
      const fontSizeDataUpdate: IPupilPreferenceDataUpdate = {
        aaCode: 'FTS',
        checkCode: preferenceUpdate.checkCode,
        prefField: 'pupilfontSizes_id',
        prefTable: '[pupilFontSizes]',
        prefCode: preferenceUpdate.preferences.fontSizeCode
      }
      dataUpdates.push(fontSizeDataUpdate)
    }
    await this.dataService.updatePupilPreferences(dataUpdates)
    const pupilUUID = await this.dataService.getPupilUUIDByCheckCode(preferenceUpdate.checkCode)
    functionBindings.checkSyncQueue = []
    functionBindings.checkSyncQueue.push({
      pupilUUID: pupilUUID,
      version: 1
    })
  }
}

export interface IPupilPreferenceUpdate {
  checkCode: string
  preferences: {
    fontSizeCode?: string
    colourContrastCode?: string
  }
}

export interface IPupilPreferenceDataUpdate {
  checkCode: string
  prefField: string
  prefCode: string
  prefTable: string
  aaCode: string
}

export interface IPupilPrefsDataService {
  updatePupilPreferences (dataUpdates: Array<IPupilPreferenceDataUpdate>): Promise<void>
  getPupilUUIDByCheckCode (checkCode: string): Promise<any>
}

export class PupilPrefsDataService implements IPupilPrefsDataService {

  private sqlService: SqlService
  private redisService: RedisService

  constructor () {
    this.sqlService = new SqlService()
    this.redisService = new RedisService()
  }

  updatePupilPreferences (dataUpdates: Array<IPupilPreferenceDataUpdate>): Promise<void> {
    const requests: Array<ITransactionRequest> = dataUpdates.map(upd => {
      return this.buildUpdateRequest(upd)
    })
    return this.sqlService.modifyWithTransaction(requests)
  }

  async getPupilUUIDByCheckCode (checkCode: string): Promise<any> {
    const cachedPupilUuid = await this.redisService.get(`pupil-uuid-lookup:${checkCode}`)
    if (cachedPupilUuid !== undefined) {
      return cachedPupilUuid
    }
    const sql = `
      SELECT p.urlSlug as pupilUUID FROM [mtc_admin].[pupil] p
        INNER JOIN [mtc_admin].[check] c ON c.pupil_id = p.id
        WHERE c.checkCode=@checkCode`
    const params = [
      {
        name: 'checkCode',
        type: TYPES.UniqueIdentifier,
        value: checkCode
      }
    ]
    const result = await this.sqlService.query(sql, params)
    if (result.length === 1) {
      return result[0].pupilUUID
    }
  }

  private buildUpdateRequest (dataUpdate: IPupilPreferenceDataUpdate): ITransactionRequest {
    const sql = `UPDATE mtc_admin.[pupilAccessArrangements]
    SET ${dataUpdate.prefField} = (
     SELECT id FROM mtc_admin.${dataUpdate.prefTable}
     WHERE code = @prefCode
    )
    WHERE pupil_Id = (
       SELECT p.id FROM mtc_admin.[pupil] p
       INNER JOIN mtc_admin.[check] chk
       ON chk.pupil_id = p.id
       WHERE chk.checkCode = @checkCode
    ) AND accessArrangements_id = (
       SELECT id FROM mtc_admin.[accessArrangements]
       WHERE code = @accessArrangementCode
    )`

    const params = [
      {
        name: 'checkCode',
        value: dataUpdate.checkCode,
        type: TYPES.UniqueIdentifier
      },
      {
        name: 'prefCode',
        value: dataUpdate.prefCode,
        type: TYPES.Char
      },
      {
        name: 'accessArrangementCode',
        value: dataUpdate.aaCode,
        type: TYPES.Char
      }
    ]
    return {
      params: params,
      sql: sql
    }
  }
}

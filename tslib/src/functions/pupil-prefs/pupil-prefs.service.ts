import { SqlService, type ITransactionRequest } from '../../sql/sql.service'
import { TYPES } from 'mssql'
import { type IPupilPrefsFunctionBindings } from './IPupilPrefsFunctionBindings'
import { RedisService } from '../../caching/redis-service'
import { type ILogger } from '../../common/logger'

export class PupilPrefsService {
  private readonly dataService: IPupilPrefsDataService
  private readonly logger: ILogger | undefined

  constructor (pupilPrefsDataService?: IPupilPrefsDataService, logger?: ILogger) {
    if (logger !== undefined) {
      this.logger = logger
    }
    if (pupilPrefsDataService === undefined) {
      pupilPrefsDataService = new PupilPrefsDataService(this.logger)
    }
    this.dataService = pupilPrefsDataService
  }

  async update (preferenceUpdate: IPupilPreferenceUpdate): Promise<IPupilPrefsFunctionBindings> {
    const dataUpdates = new Array<IPupilPreferenceDataUpdate>()
    const output: IPupilPrefsFunctionBindings = {
      checkSyncQueue: []
    }

    if (preferenceUpdate.preferences.colourContrastCode !== undefined) {
      const colourContrastDataUpdate: IPupilPreferenceDataUpdate = {
        aaCode: 'CCT',
        checkCode: preferenceUpdate.checkCode,
        prefField: 'colourContrastLookUp_Id',
        prefTable: '[colourContrastLookUp]',
        prefCode: preferenceUpdate.preferences.colourContrastCode
      }
      dataUpdates.push(colourContrastDataUpdate)
    }

    if (preferenceUpdate.preferences.fontSizeCode !== undefined) {
      const fontSizeDataUpdate: IPupilPreferenceDataUpdate = {
        aaCode: 'FTS',
        checkCode: preferenceUpdate.checkCode,
        prefField: 'fontSizeLookUp_Id',
        prefTable: '[fontSizeLookUp]',
        prefCode: preferenceUpdate.preferences.fontSizeCode
      }
      dataUpdates.push(fontSizeDataUpdate)
    }
    await this.dataService.updatePupilPreferences(dataUpdates)
    const pupilUUID = await this.dataService.getPupilUUIDByCheckCode(preferenceUpdate.checkCode)
    output.checkSyncQueue.push({
      pupilUUID,
      version: 1
    })
    return output
  }
}

export interface IPupilPreferenceUpdate {
  checkCode: string
  preferences: {
    fontSizeCode?: string
    colourContrastCode?: string
  }
  version: number
}

export interface IPupilPreferenceDataUpdate {
  checkCode: string
  prefField: string
  prefCode: string
  prefTable: string
  aaCode: string
}

export interface IPupilPrefsDataService {
  updatePupilPreferences (dataUpdates: IPupilPreferenceDataUpdate[]): Promise<void>
  getPupilUUIDByCheckCode (checkCode: string): Promise<any>
}

export class PupilPrefsDataService implements IPupilPrefsDataService {
  private readonly sqlService: SqlService
  private readonly redisService: RedisService

  constructor (logger?: ILogger) {
    this.sqlService = new SqlService(logger)
    this.redisService = new RedisService()
  }

  async updatePupilPreferences (dataUpdates: IPupilPreferenceDataUpdate[]): Promise<void> {
    const requests: ITransactionRequest[] = dataUpdates.map(upd => {
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
    if (result.length !== 1) {
      throw new Error(`pupil-prefs: pupil UUID lookup has ${result.length} rows, when expecting 1 only`)
    }
    return result[0].pupilUUID
  }

  private buildUpdateRequest (dataUpdate: IPupilPreferenceDataUpdate): ITransactionRequest {
    const sql = `
DECLARE @pupilId INT;
DECLARE @prefCodeId INT;
DECLARE @accessArrangementsId INT;
DECLARE @errorMessage NVARCHAR(max);

SET @prefCodeId = (SELECT id FROM mtc_admin.${dataUpdate.prefTable} WHERE code = @prefCode);
SET @errorMessage = (SELECT concat('ID not found for code "', @prefCode, '"'));
IF @prefCodeId IS NULL THROW 50002, @errorMessage, 1;

SET @pupilId = (SELECT p.id
                  FROM mtc_admin.[pupil] p
                       INNER JOIN mtc_admin.[check] chk ON chk.pupil_id = p.id
                 WHERE chk.checkCode = @checkCode);
IF @pupilId IS NULL THROW 50002, 'pupilId not found', 1;

SET @accessArrangementsId = (SELECT id FROM mtc_admin.[accessArrangements] WHERE code = @accessArrangementCode);
SET @errorMessage = (SELECT concat('accessArrangements_id not found for "', @accessArrangementCode, '"'));
IF @accessArrangementsId IS NULL THROW 50002, @errorMessage, 1;

UPDATE mtc_admin.[pupilAccessArrangements]
   SET ${dataUpdate.prefField} = @prefCodeId
 WHERE pupil_Id = @pupilId
   AND accessArrangements_id = @accessArrangementsId;
    `
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
      params,
      sql
    }
  }
}

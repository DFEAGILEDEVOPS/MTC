import { TYPES } from 'mssql'
import { SqlService, ITransactionRequest } from '../../sql/sql.service'

let sut: PupilPrefsService

describe('pupil-prefs.service', () => {

  beforeEach(() => {
    sut = new PupilPrefsService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test.todo('infer table updates from batch inputs')
})

export class PupilPrefsService {
  private dataService: IPupilPrefsDataService

  constructor (pupilPrefsDataService?: IPupilPrefsDataService) {
    if (pupilPrefsDataService === undefined) {
      pupilPrefsDataService = new PupilPrefsDataService()
    }
    this.dataService = pupilPrefsDataService
  }

  async update (preferenceUpdates: Array<IPupilPreferenceUpdate>): Promise<void> {
    // TODO infer table and type etc
    // TODO send as batch
    const batch: Array<IPupilPreferenceDataUpdate> = []
    return this.dataService.updatePupilPreferences(batch)
  }
}

export interface IPupilPreferenceUpdate {
  checkCode: string
  preferenceCode: string
  accessArrangementCode: string
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
}

export class PupilPrefsDataService implements IPupilPrefsDataService {
  private sqlService: SqlService

  constructor () {
    this.sqlService = new SqlService()
  }

  updatePupilPreferences (dataUpdates: Array<IPupilPreferenceDataUpdate>): Promise<void> {
    const requests: Array<ITransactionRequest> = []
    for (const dataUpdate of dataUpdates) {
      const request = this.buildUpdateRequest(dataUpdate)
      requests.push(request)
    }
    return this.sqlService.modifyWithTransaction(requests)
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

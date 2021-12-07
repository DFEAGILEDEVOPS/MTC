import moment from 'moment';
const sqlService = require('../../data-access/sql.service')
const uuidValidate = require('uuid-validate')

export interface Check {
  id: number,
  createdAt: moment.Moment
  updatedAt: moment.Moment,
  pupilId: number,
  checkCode: string,
  checkWindowId: number,
  checkFormId: number,
  pupilLoginDate: null | moment.Moment,
  receivedByServerAt: null | moment.Moment,
  isLiveCheck: boolean,
  received: boolean,
  complete: boolean,
  completedAt: null | moment.Moment,
  processingFailed: boolean,
  createdByUserId: number,
  inputAssistantAddedRetrospectively: boolean,
  resultsSynchronised: boolean
}

export interface Pupil {
  id: number
}

export class PupilHistoryDataService {
  public static async getChecks (uuid: string): Promise<Check[]> {
    if (uuidValidate(uuid) === false) {
      throw new Error(`UUID is not valid: ${uuid}`)
    }
    const sql = `
      SELECT
       *
      FROM
        mtc_admin.[check] c JOIN
        mtc_admin.[pupil] p ON (c.pupil_id = p.id)
      WHERE
        p.urlSlug = @slug
    `
    const params = [
      { name: 'slug', value: uuid, type: sqlService.TYPES.UniqueIdentifier }
    ]
    const data = await sqlService.readonlyQuery(sql, params)

    if (!Array.isArray(data)){
      return []
    }

    return data.map( o => {
      return {
        checkCode: o.checkCode,
        checkFormId: o.checkForm_id,
        checkWindowId: o.checkWindow_id,
        complete: o.complete,
        completedAt: o.completedAt,
        createdAt: o.createdAt,
        createdByUserId: o.createdBy_userId,
        id: o.id,
        inputAssistantAddedRetrospectively: o.inputAssistantAddedRetrospectively,
        isLiveCheck: o.isLiveCheck,
        processingFailed: o.processingFailed,
        pupilId: o.pupil_id,
        pupilLoginDate: o.pupilLoginDate,
        received: o.received,
        receivedByServerAt: o.receivedByServerAt,
        resultsSynchronised: o.resultsSynchronised,
        updatedAt: o.updatedAt
      }
    })
  }
}

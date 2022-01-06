import moment from 'moment';
const sqlService = require('../../data-access/sql.service')
const uuidValidate = require('uuid-validate')
const R = require('ramda')

export interface ICheckData {
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

export interface IPupilData {
  id: number,
  createdAt: moment.Moment,
  updatedAt: moment.Moment,
  schoolId: number,
  foreName: string,
  middleNames: string,
  lastName: string,
  gender: string,
  dateOfBirth: moment.Moment,
  upn: string,
  urlSlug: string,
  groupId: number | null,
  currentCheckId: number | null,
  checkComplete: boolean,
  restartAvailable: boolean,
  attendanceId: number | null,
  foreNameAlias: string | null,
  lastNameAlias: string | null
}

export interface ISchoolData {
  id: number,
  createdAt: moment.Moment,
  updatedAt: moment.Moment,
  leaCode: number,
  estabCode: number,
  name: string,
  pin: string | null,
  pinExpiresAt: moment.Moment | null,
  urlSlug: string,
  urn: number,
  dfeNumber: number
}

export interface IRestartData {
  id: number,
  createdAt: moment.Moment,
  updatedAt: moment.Moment,
  pupilId: number,
  restartReason: string,
  restartReasonCode: string,
  checkId: number,
  originCheckId: number
}

export interface IPupilHistoryData {
  pupil: IPupilData,
  checks: ICheckData[]
  school: ISchoolData
  restarts: IRestartData[]
}

export class PupilHistoryDataService {
  public static async getPupil(pupilUuid: string): Promise<IPupilData> {
    if (uuidValidate(pupilUuid) === false) {
      throw new Error(`UUID is not valid: ${pupilUuid}`)
    }
    const sql = `
      SELECT
        *
      FROM
        mtc_admin.[pupil]
      WHERE
        urlSlug = @slug
    `
    const params = [
      { name: 'slug', value: pupilUuid, type: sqlService.TYPES.UniqueIdentifier }
    ]
    const data = await sqlService.readonlyQuery(sql, params)

    if (data.length === 0) {
      throw new Error('Pupil not found')
    }

    const pupil: IPupilData = {
      id: data[0].id as number,
      createdAt: data[0].createdAt,
      updatedAt: data[0].updatedAt,
      schoolId: data[0].school_id,
      foreName: data[0].foreName,
      middleNames: data[0].middleNames,
      lastName: data[0].lastName,
      gender: data[0].gender,
      dateOfBirth: data[0].dateOfBirth,
      upn: data[0].upn,
      urlSlug: data[0].urlSlug,
      groupId: data[0].group_id,
      currentCheckId: data[0].currentCheckId,
      checkComplete: data[0].checkComplete,
      restartAvailable: data[0].restartAvailable,
      attendanceId: data[0].attendanceId,
      foreNameAlias: data[0].foreNameAlias,
      lastNameAlias: data[0].lastNameAlias
    }
    return pupil
  }

  public static async getChecks (uuid: string): Promise<ICheck[]> {
    if (uuidValidate(uuid) === false) {
      throw new Error(`UUID is not valid: ${uuid}`)
    }
    const sql = `
      SELECT
       c.*
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

    if (!Array.isArray(data)) {
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

  public static async getSchool (pupilUuid: string): Promise<ISchoolData> {
    if (uuidValidate(pupilUuid) === false) {
      throw new Error(`UUID is not valid: ${pupilUuid}`)
    }
    const sql = `
      SELECT
        s.*
      FROM
        mtc_admin.[school] s JOIN mtc_admin.[pupil] p ON (s.id = p.school_id)
      WHERE
        p.urlSlug = @slug
    `
    const params = [
      { name: 'slug', value: pupilUuid, type: sqlService.TYPES.UniqueIdentifier }
    ]
    const data = await sqlService.readonlyQuery(sql, params)
    const school = R.omit(['version'], data[0])
    return school
  }

  public static async getRestarts (pupilUuid: string): Promise<IRestartData[]> {
    const sql = `
      SELECT
        r.*,
        rrl.code,
        rrl.description
      FROM
        [mtc_admin].[pupilRestart] r JOIN
        [mtc_admin].[pupil] p ON (r.pupil_id = p.id) JOIN
        [mtc_admin].[restartReasonLookup] rrl ON (r.restartReasonLookup_id = rrl.id)
      WHERE
        p.urlSlug = @slug
      AND
        r.isDeleted = 0
    `

    const params = [
      { name: 'slug', value: pupilUuid, type: sqlService.TYPES.UniqueIdentifier }
    ]

    const data = await sqlService.readonlyQuery(sql, params)
    return data.map( o => {
      return {
        id: o.id,
        pupilId: o.pupil_id,
        restartReason: o.description,
        restartReasonCode: o.code,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        checkId: o.checkId,
        originCheckId: o.originCheck_id
      }
    })
  }

  public static async getPupilHistory (pupilUuid: string): Promise<IPupilHistoryData> {
    const pupil = await PupilHistoryDataService.getPupil(pupilUuid)
    const checks = await PupilHistoryDataService.getChecks(pupilUuid)
    const school = await PupilHistoryDataService.getSchool(pupilUuid)
    const restarts = await PupilHistoryDataService.getRestarts(pupilUuid)
    return {
      pupil,
      checks,
      school,
      restarts
    }
  }
}

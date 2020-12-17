import { ISqlService, SqlService } from '../../sql/sql.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { TYPES } from 'mssql'
import {
  PupilResult,
  Pupil,
  School,
  CheckConfig,
  CheckConfigOrNull,
  CheckOrNull,
  Check,
  CheckForm,
  CheckFormOrNull,
  AnswersOrNull, Answer
} from './models'
import * as R from 'ramda'
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
        SELECT TOP(10)  -- TODO: remove constraint
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
            p.urlSlug,
            ac.reason as notTakingCheckReason
          FROM mtc_admin.pupil p
               JOIN      mtc_admin.school s ON (p.school_id = s.id)
               LEFT JOIN mtc_admin.attendanceCode ac ON (p.attendanceId = ac.id)
         WHERE s.urlSlug = @slug
         ORDER BY p.checkComplete DESC -- TODO: remove order by
    `
    const params = [
      { name: 'slug', value: schoolUuid, type: TYPES.UniqueIdentifier }
    ]

    interface dbPupil {
      attendanceId: number | null
      checkComplete: boolean
      currentCheckId: number | null
      dateOfBirth: moment.Moment
      foreName: string
      gender: 'M' | 'F'
      id: number
      lastName: string
      notTakingCheckReason: string | null
      school_id: number
      urlSlug: string
      upn: string
    }

    const data: dbPupil[] = await this.sqlService.query(sql, params)

    const pupils: Pupil[] = data.map(o => {
      const pupil: Pupil = {
        attendanceId: o.attendanceId,
        checkComplete: o.checkComplete,
        currentCheckId: o.currentCheckId,
        dateOfBirth: o.dateOfBirth,
        forename: o.foreName,
        gender: o.gender,
        id: o.id,
        lastname: o.lastName,
        notTakingCheckReason: o.notTakingCheckReason,
        schoolId: o.school_id,
        slug: o.urlSlug,
        upn: o.upn
      }
      return pupil
    })
    return pupils
  }

  private async getSchool (schoolId: number): Promise<School> {
    this.logger.verbose(`${functionName}: getSchool() called for school ${schoolId}`)
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

  private async getCheckConfig (currentCheckId: number | null): Promise<CheckConfigOrNull> {
    this.logger.verbose(`${functionName}: getCheckConfig() called for check ${currentCheckId}`)
    if (currentCheckId === null) {
      return null
    }
    const sql = `
        SELECT payload
          FROM mtc_admin.checkConfig
         WHERE check_id = @checkId
    `
    interface dbSettings {
      payload: string
    }
    const res: dbSettings[] = await this.sqlService.query(sql, [{ name: 'checkId', value: currentCheckId, type: TYPES.Int }])
    const data = R.head(res)
    if (data === undefined) {
      throw new Error('getCheckConfig(): failed to retrieve any settings')
    }
    const config: CheckConfig = JSON.parse(data.payload)
    return config
  }

  private async getCheck (currentCheckId: number | null): Promise<CheckOrNull> {
    this.logger.verbose(`${functionName}: getCheck() called for check ${currentCheckId}`)
    if (currentCheckId === null) {
      // For pupils that have not taken a check, or are not attending
      return null
    }
    const sql = `
        SELECT
            c.id,
            c.checkCode,
            c.checkForm_id,
            c.checkWindow_id,
            c.complete,
            c.completedAt,
            c.inputAssistantAddedRetrospectively,
            c.isLiveCheck,
            cr.mark,
            c.processingFailed,
            c.pupilLoginDate,
            c.received,
            (select count(*) from mtc_admin.pupilRestart where pupil_id = c.pupil_id and isDeleted = 0) as restartNumber
          FROM mtc_admin.[check] c
               JOIN mtc_results.checkResult cr ON (c.id = cr.check_id)
         WHERE check_id = @checkId
    `
    interface dbCheck {
      id: number
      checkCode: string
      checkForm_id: number
      checkWindow_id: number
      complete: boolean
      completedAt: moment.Moment
      inputAssistantAddedRetrospectively: boolean
      isLiveCheck: boolean
      mark: number
      processingFailed: boolean
      pupilLoginDate: moment.Moment
      received: boolean
      restartNumber: number
    }
    const res: dbCheck[] = await this.sqlService.query(sql, [{ name: 'checkId', value: currentCheckId, type: TYPES.Int }])
    const data = R.head(res)
    if (data === undefined) {
      throw new Error('getCheck(): No result data found')
    }
    const check: Check = {
      id: data.id,
      checkCode: data.checkCode,
      checkFormId: data.checkForm_id,
      checkWindowId: data.checkWindow_id,
      complete: data.complete,
      completedAt: data.completedAt,
      inputAssistantAddedRetrospectively: data.inputAssistantAddedRetrospectively,
      isLiveCheck: data.isLiveCheck,
      mark: data.mark,
      processingFailed: data.processingFailed,
      pupilLoginDate: data.pupilLoginDate,
      received: data.received,
      restartNumber: data.restartNumber
    }
    return check
  }

  private async getCheckForm (checkId: number | null): Promise<CheckFormOrNull> {
    if (checkId === null) {
      return null
    }
    interface DBCheckForm {
      id: number
      name: string
      formData: string
    }
    interface Form {
      f1: number
      f2: number
    }

    const sql = `
        SELECT cf.id, cf.name, cf.formData
          FROM mtc_admin.[check] c
               JOIN mtc_admin.checkForm cf ON (c.checkForm_id = cf.id)
         WHERE c.id = @checkId
    `
    const res: DBCheckForm[] = await this.sqlService.query(sql, [{ name: 'checkId', value: checkId, type: TYPES.Int }])
    const data = R.head(res)
    if (data === undefined) {
      throw new Error(`CheckForm for check ${checkId} not found`)
    }
    const formData: Form[] = JSON.parse(data.formData)
    const form: CheckForm = {
      id: data.id,
      name: data.name,
      items: formData.map((o, i) => { return { f1: o.f1, f2: o.f2, questionNumber: (i + 1) } })
    }
    return form
  }

  private async getAnswers (checkId: number | null): Promise<AnswersOrNull> {
    if (checkId === null) {
      return null
    }

    const sql = `
      SELECT
        a.answer,
        q.code as questionCode,
        CONCAT(q.factor1, 'x', q.factor2) as question,
        a.isCorrect,
        a.browserTimestamp
      FROM mtc_results.checkResult cr JOIN mtc_results.answer a ON (cr.id = a.checkResult_id) 
      JOIN mtc_admin.question q ON (a.question_id = q.id)
      WHERE cr.check_id = @checkId
    `
    interface DBAnswer {
      answer: string
      questionCode: string
      question: string
      isCorrect: boolean
      browserTimestamp: moment.Moment
    }

    const res: DBAnswer[] = await this.sqlService.query(sql, [{ name: 'checkId', value: checkId, type: TYPES.Int }])
    const answers: Answer[] = res.map(o => {
      return {
        response: o.answer,
        inputType: 'x', // TODO
        isCorrect: o.isCorrect,
        questionCode: o.questionCode,
        question: o.question,
        browserTimestamp: o.browserTimestamp,
        inputs: [] // TODO
      }
    })
    return answers
  }

  public async getPupilData (pupil: Pupil): Promise<PupilResult> {
    this.logger.verbose(`${functionName}: getPupilData() called for pupil ${pupil.slug}`)
    const promises: [
      Promise<School>,
      Promise<CheckConfigOrNull>,
      Promise<CheckOrNull>,
      Promise<CheckFormOrNull>,
      Promise<AnswersOrNull>
    ] = [
      this.getSchool(pupil.schoolId),
      this.getCheckConfig(pupil.currentCheckId),
      this.getCheck(pupil.currentCheckId),
      this.getCheckForm(pupil.currentCheckId),
      this.getAnswers(pupil.currentCheckId)
    ]
    const [school, checkConfig, check, checkForm, answers] = await Promise.all(promises)
    return {
      pupil,
      school,
      checkConfig: checkConfig,
      check: check,
      checkForm: checkForm,
      answers: answers
    }
  }
}

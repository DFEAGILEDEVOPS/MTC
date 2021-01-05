import { ISqlService, SqlService } from '../../sql/sql.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { TYPES } from 'mssql'
import {
  Answer,
  AnswersOrNull,
  Check,
  CheckConfigOrNull,
  CheckForm,
  CheckFormOrNull,
  CheckOrNull,
  Device,
  DeviceOrNull,
  Event,
  EventsOrNull,
  Input,
  InputMap,
  Pupil,
  PupilResult,
  School
} from './models'
import * as R from 'ramda'
import moment from 'moment'

const functionName = 'ps-report-2-pupil-data'

export interface IPsReportDataService {
  getPupils (schoolUuid: string): Promise<Pupil[]>

  getPupilData (pupil: Pupil, school: School): Promise<PupilResult>

  getSchool (schoolId: number): Promise<School>
}

export class PsReportDataService {
  private readonly logger: ILogger
  private readonly sqlService: ISqlService

  constructor (logger?: ILogger, sqlService?: ISqlService) {
    this.logger = logger ?? new ConsoleLogger()
    this.sqlService = sqlService ?? new SqlService(this.logger)
  }

  /**
   * Retrieve a list of all pupils from the Database for a particular school
   * @param schoolUuid
   */
  public async getPupils (schoolUuid: string): Promise<Pupil[]> {
    const sql = `
        SELECT
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
    `
    const params = [
      { name: 'slug', value: schoolUuid, type: TYPES.UniqueIdentifier }
    ]

    interface DBPupil {
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

    const data: DBPupil[] = await this.sqlService.query(sql, params)

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

  /**
   * Retrieve a school's details from the database
   * @param schoolId
   */
  public async getSchool (schoolId: number): Promise<School> {
    const sql = `
        SELECT estabCode, id, leaCode, name, urlSlug, urn
          FROM mtc_admin.school
         WHERE school.id = @schoolId
    `
    interface DBSchool {
      estabCode: number
      id: number
      leaCode: number
      name: string
      urlSlug: string
      urn: number
    }
    const res: DBSchool[] = await this.sqlService.query(sql, [{ name: 'schoolId', value: schoolId, type: TYPES.Int }])
    const data = R.head(res)
    if (data === undefined) {
      throw new Error(`${functionName}: ERROR: School not found: ${schoolId}`)
    }
    const school: School = {
      estabCode: data.estabCode,
      id: data.id,
      laCode: data.leaCode,
      name: data.name,
      slug: data.urlSlug,
      urn: data.urn
    }
    return school
  }

  /**
   * Retrieve the settings assigned to the pupil check from the database
   * @param checkId
   */
  public async getCheckConfig (checkId: number | null): Promise<CheckConfigOrNull> {
    if (checkId === null) {
      return null
    }
    const sql = `
        SELECT payload
          FROM mtc_admin.checkConfig
         WHERE check_id = @checkId
    `

    interface DBSettings {
      payload: string
    }

    const res: DBSettings[] = await this.sqlService.query(sql, [{ name: 'checkId', value: checkId, type: TYPES.Int }])
    const data = R.head(res)
    if (data === undefined) {
      throw new Error('getCheckConfig(): failed to retrieve any settings')
    }
    return JSON.parse(data.payload)
  }

  /**
   * Retrieve the check and result from the database
   * @param checkId
   */
  public async getCheck (checkId: number | null): Promise<CheckOrNull> {
    if (checkId === null) {
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

    interface DBCheck {
      checkCode: string
      checkForm_id: number
      checkWindow_id: number
      complete: boolean
      completedAt: moment.Moment
      id: number
      inputAssistantAddedRetrospectively: boolean
      isLiveCheck: boolean
      mark: number
      processingFailed: boolean
      pupilLoginDate: moment.Moment
      received: boolean
      restartNumber: number
    }

    const res: DBCheck[] = await this.sqlService.query(sql, [{ name: 'checkId', value: checkId, type: TYPES.Int }])
    const data = R.head(res)
    if (data === undefined) {
      // If we pupil has had a pin generated but never set the check, or never returned the check then we expect the check
      // to be there but not the check result.  As the results are missing there is no data to provide.
      return null
    }
    const check: Check = {
      checkCode: data.checkCode,
      checkFormId: data.checkForm_id,
      checkWindowId: data.checkWindow_id,
      complete: data.complete,
      completedAt: data.completedAt,
      id: data.id,
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

  /**
   * Retrieve the checkForm from the database
   * TODO: add caching
   * @param checkId
   */
  public async getCheckForm (checkId: number | null): Promise<CheckFormOrNull> {
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
      items: formData.map((o, i) => {
        return { f1: o.f1, f2: o.f2, questionNumber: (i + 1) }
      })
    }
    return form
  }

  /**
   * Retrieve the inputs that constitute the answer from the database
   * @param checkId
   */
  public async getInputs (checkId: number): Promise<InputMap> {
    const sql = `
        SELECT a.id as answer_id, ui.userInput, uitl.code as userInputType, ui.browserTimestamp
          FROM mtc_results.checkResult cr
               JOIN      mtc_results.answer a ON (cr.id = a.checkResult_id)
               LEFT JOIN mtc_results.userInput ui ON (a.id = ui.answer_id)
               LEFT JOIN mtc_results.userInputTypeLookup uitl ON (ui.userInputTypeLookup_id = uitl.id)
         WHERE cr.check_id = @checkId
    `

    interface DBInput {
      answer_id: number
      userInput: string | null
      inputType: 'M' | 'K' | 'T' | 'P' | 'X' | null
      browserTimestamp: moment.Moment | null
    }

    const res: DBInput[] = await this.sqlService.query(sql, [{ name: 'checkId', value: checkId, type: TYPES.Int }])
    // Now we have the inputs we need to turn them into a map
    const inputMap: InputMap = new Map()
    res.forEach(o => {
      const answerId = o.answer_id
      if (o.userInput === null || o.inputType === null || o.browserTimestamp === null) {
        // The nulls are caused by the left join in the SQL - no input
        inputMap.set(o.answer_id, null)
        return
      }
      const input: Input = {
        answerId: answerId,
        browserTimestamp: o.browserTimestamp,
        input: o.userInput,
        inputType: o.inputType
      }
      const existingInputs = inputMap.get(answerId)
      if (Array.isArray(existingInputs)) {
        inputMap.set(answerId, R.append(input, existingInputs))
      } else {
        inputMap.set(answerId, [input])
      }
    })
    return inputMap
  }

  /**
   * Retrieve answers and their inputs from the database
   * @param checkId
   */
  public async getAnswers (checkId: number | null): Promise<AnswersOrNull> {
    if (checkId === null) {
      return null
    }

    const sql = `
        SELECT
            a.id,
            a.answer,
            q.code as questionCode,
            CONCAT(q.factor1, 'x', q.factor2) as question,
            a.isCorrect,
            a.browserTimestamp
          FROM mtc_results.checkResult cr
               JOIN mtc_results.answer a ON (cr.id = a.checkResult_id)
               JOIN mtc_admin.question q ON (a.question_id = q.id)
         WHERE cr.check_id = @checkId
    `

    interface DBAnswer {
      id: number
      answer: string
      questionCode: string
      question: string
      isCorrect: boolean
      browserTimestamp: moment.Moment
    }

    const resAnswers: DBAnswer[] = await this.sqlService.query(sql, [{ name: 'checkId', value: checkId, type: TYPES.Int }])
    const inputsMap: InputMap = await this.getInputs(checkId)

    const answers: Answer[] = resAnswers.map(o => {
      const inputs = inputsMap.get(o.id)
      return {
        browserTimestamp: o.browserTimestamp,
        id: o.id,
        inputs: inputs ?? null, // ensure undefined does not get set
        isCorrect: o.isCorrect,
        question: o.question,
        questionCode: o.questionCode,
        response: o.answer
      }
    })
    return answers
  }

  /**
   * Retrieve device information from the database
   * @param checkId
   */
  public async getDevice (checkId: number | null): Promise<DeviceOrNull> {
    if (checkId === null) {
      return null
    }
    const sql = `
        SELECT bfl.family as browserFamily, ud.browserMajorVersion, ud.browserMinorVersion, ud.browserPatchVersion, ud.ident
          FROM mtc_results.checkResult cr
               LEFT JOIN mtc_results.userDevice ud ON (cr.userDevice_id = ud.id)
               LEFT JOIN mtc_results.browserFamilyLookup bfl ON (ud.browserFamilyLookup_id = bfl.id)
         WHERE cr.check_id = @checkId
    `

    interface DBDevice {
      browserFamily: string | null
      browserMajorVersion: number | null
      browserMinorVersion: number | null
      browserPatchVersion: number | null
      ident: string | null
    }

    const res: DBDevice[] = await this.sqlService.query(sql, [{ name: 'checkId', value: checkId, type: TYPES.Int }])
    const data = R.head(res)
    if (data === undefined) {
      return null
    }
    const device: Device = {
      browserFamily: data.browserFamily,
      browserMajorVersion: data.browserMajorVersion,
      browserMinorVersion: data.browserMinorVersion,
      browserPatchVersion: data.browserPatchVersion,
      deviceId: data.ident,
      type: null, // TODO: store this at sync time
      typeModel: null // TODO: store this at sync time
    }
    return device
  }

  /**
   * Retrieve event information ordered by datetime from the database
   * @param checkId
   */
  public async getEvents (checkId: number | null): Promise<EventsOrNull> {
    if (checkId === null) {
      return null
    }
    const sql = `
        SELECT
            e.id,
            e.browserTimestamp,
            etl.eventType,
            e.eventData,
            q.code as questionCode,
            e.questionNumber,
            IIF(q.id IS NOT NULL, CONCAT(q.factor1, 'x', q.factor2), NULL) AS question,
            q.isWarmup
          FROM mtc_results.event e
               LEFT JOIN mtc_results.checkResult cr ON (e.checkResult_id = cr.id)
               LEFT JOIN mtc_results.eventTypeLookup etl ON (e.eventTypeLookup_id = etl.id)
               LEFT JOIN mtc_admin.question q ON (e.question_id = q.id)
         WHERE cr.check_id = @checkId
         ORDER BY e.browserTimestamp
    `
    interface DBEvent {
      id: number
      browserTimestamp: moment.Moment
      eventType: string
      eventData: any | null
      questionCode: string | null
      questionNumber: number | null
      question: string | null
      isWarmup: boolean | null
    }

    const res: DBEvent[] = await this.sqlService.query(sql, [{ name: 'checkId', value: checkId, type: TYPES.Int }])

    if (res.length === 0) {
      return null
    }

    const events: Event[] = res.map(o => {
      const e: Event = {
        browserTimestamp: o.browserTimestamp,
        data: JSON.parse(o.eventData),
        id: o.id,
        isWarmup: o.isWarmup,
        question: o.question,
        questionCode: o.questionCode,
        questionNumber: o.questionNumber,
        type: o.eventType
      }
      return e
    })

    return events
  }

  /**
   * Entry point to create the data structure to pass to the transform step in the psychometric report generation
   * @param pupil
   */
  public async getPupilData (pupil: Pupil, school: School): Promise<PupilResult> {
    const promises: [
      Promise<CheckConfigOrNull>,
      Promise<CheckOrNull>,
      Promise<CheckFormOrNull>,
      Promise<AnswersOrNull>,
      Promise<DeviceOrNull>,
      Promise<EventsOrNull>
    ] = [
      this.getCheckConfig(pupil.currentCheckId),
      this.getCheck(pupil.currentCheckId),
      this.getCheckForm(pupil.currentCheckId),
      this.getAnswers(pupil.currentCheckId),
      this.getDevice(pupil.currentCheckId),
      this.getEvents(pupil.currentCheckId)
    ]
    const [checkConfig, check, checkForm, answers, device, events] = await Promise.all(promises)
    return {
      pupil,
      school,
      checkConfig: checkConfig,
      check: check,
      checkForm: checkForm,
      answers: answers,
      device: device,
      events: events
    }
  }
}

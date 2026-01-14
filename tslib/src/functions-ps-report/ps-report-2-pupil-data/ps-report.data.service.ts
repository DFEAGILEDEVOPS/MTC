import { type ISqlService, SqlService } from '../../sql/sql.service'
import { TYPES } from 'mssql'
import {
  type InputAssistantOrNull,
  type Answer,
  type AnswersOrNull,
  type Check,
  type CheckConfigOrNull,
  type CheckForm,
  type CheckFormOrNull,
  type CheckOrNull,
  type Device,
  type DeviceOrNull,
  type Event,
  type EventsOrNull,
  type Input,
  type InputMap,
  type NotTakingCheckCode,
  type Pupil,
  type PupilResult, type RestartReasonCode,
  type School
} from './pupil-data.models'
import * as R from 'ramda'
import type moment from 'moment'
import { type ILogger } from '../../common/logger'
const RA = require('ramda-adjunct')

const functionName = 'ps-report-2-pupil-data'

export interface IPsReportDataService {
  getPupils (schoolUuid: string): Promise<readonly Pupil[]>

  getPupilData (pupil: Pupil, school: School): Promise<PupilResult>

  getSchool (schoolId: number): Promise<School>

  getBulkCheckData (pupils: readonly Pupil[]): Promise<Map<number, { check: CheckOrNull, config: CheckConfigOrNull, form: CheckFormOrNull, answers: AnswersOrNull, device: DeviceOrNull, events: EventsOrNull, inputAssistant: InputAssistantOrNull }>>
}

interface PupilRestart {
  id: number
  code: RestartReasonCode
}

export class PsReportDataService {
  private readonly sqlService: ISqlService
  private readonly logger: ILogger
  private readonly checkFormCache = new Map<number, CheckForm>()

  constructor (logger: ILogger, sqlService?: ISqlService) {
    this.logger = logger
    this.sqlService = sqlService ?? new SqlService(this.logger)
  }

  /**
   * Return all the pupil restarts that are not deleted for pupil in creation order
   * @param pupilId - mtc_admin.pupil.id value
   * @returns
   */
  private async sqlFindPupilRestart (pupilId: number): Promise<PupilRestart[]> {
    const sql = `
    SELECT
    pr.id,
    rrl.code
  FROM
    mtc_admin.[pupilRestart] pr
    JOIN mtc_admin.[restartReasonLookup] rrl ON (
      pr.restartReasonLookup_Id = rrl.id
    )
  WHERE
    pr.isDeleted = 0
  AND
    pupil_id = @pupilId
  ORDER BY
    pr.id
  ;
    `
    const params = [
      { name: 'pupilId', value: pupilId, type: TYPES.Int }
    ]
    return this.sqlService.query(sql, params)
  }

  private async sqlFindRestartReasonCode (pupilId: number, pupilRestartNumber: number): Promise<RestartReasonCode | null> {
    const pupilRestarts = await this.sqlFindPupilRestart(pupilId)
    if (Array.isArray(pupilRestarts)) {
      if (pupilRestartNumber <= pupilRestarts.length) {
        const pr = pupilRestarts[pupilRestartNumber - 1]
        return pr.code
      }
    }
    return null
  }

  /**
   * Retrieve a list of all pupils from the Database for a particular school
   * @param schoolUuid
   */
  public async getPupils (schoolUuid: string): Promise<readonly Pupil[]> {
    const sql = `
        SELECT
                p.id,
                p.foreName,
                p.middleNames,
                p.lastName,
                p.upn,
                p.gender,
                p.dateOfBirth,
                p.checkComplete,
                p.currentCheckId,
                p.school_id,
                p.urlSlug,
                p.job_id,
                p.restartAvailable,
                p.isEdited,
                ac.reason as notTakingCheckReason,
                ac.code as notTakingCheckCode
          FROM mtc_admin.pupil p
               JOIN      mtc_admin.school s ON (p.school_id = s.id)
               LEFT JOIN mtc_admin.attendanceCode ac ON (p.attendanceId = ac.id)
         WHERE s.urlSlug = @slug
    `
    const params = [
      { name: 'slug', value: schoolUuid, type: TYPES.UniqueIdentifier }
    ]

    interface DBPupil {
      checkComplete: boolean
      currentCheckId: number | null
      dateOfBirth: moment.Moment
      foreName: string
      gender: 'M' | 'F'
      id: number
      isEdited: boolean
      job_id: number
      lastName: string
      middleNames: string
      notTakingCheckReason: string | null
      notTakingCheckCode: NotTakingCheckCode
      restartAvailable: boolean
      school_id: number
      urlSlug: string
      upn: string
    }

    const data: DBPupil[] = await this.sqlService.query(sql, params)

    const pupils: Pupil[] = data.map(o => {
      const pupil: Pupil = Object.freeze({
        checkComplete: o.checkComplete,
        currentCheckId: o.currentCheckId,
        dateOfBirth: o.dateOfBirth,
        forename: o.foreName,
        gender: o.gender,
        id: o.id,
        isEdited: o.isEdited,
        jobId: o.job_id,
        lastname: o.lastName,
        middlenames: o.middleNames,
        restartAvailable: o.restartAvailable,
        notTakingCheckReason: o.notTakingCheckReason,
        notTakingCheckCode: o.notTakingCheckCode,
        schoolId: o.school_id,
        slug: o.urlSlug,
        upn: o.upn
      })
      return pupil
    })
    return Object.freeze(pupils)
  }

  /**
   * Retrieve a school's details from the database
   * @param schoolId
   */
  public async getSchool (schoolId: number): Promise<School> {
    // 54227: Do not include test schools in the ps report
    // ps-report-1-list-schools will exlude test schools from the fan-out, but it's possible
    // for a message to be placed on the queue manually (for consumption by this function ps-report-2-pupil-data) which
    // could be a test school.  This will cause the function to throw.
    const sql = `
        SELECT
        s.estabCode,
        s.id,
        s.leaCode,
        s.name,
        s.urlSlug,
        s.urn,
        s.isTestSchool,
        toe.code as typeOfEstablishmentCode
      FROM
        mtc_admin.school s LEFT JOIN
        mtc_admin.typeOfEstablishmentLookup toe ON (s.typeOfEstablishmentLookup_id = toe.id)
      WHERE
        s.id = @schoolId
    `
    interface DBSchool {
      estabCode: number
      id: number
      leaCode: number
      name: string
      urlSlug: string
      urn: number
      isTestSchool: boolean
      typeOfEstablishmentCode: number
    }
    const res: DBSchool[] = await this.sqlService.query(sql, [{ name: 'schoolId', value: schoolId, type: TYPES.Int }])
    const data = R.head(res)
    if (data === undefined) {
      throw new Error(`${functionName}: ERROR: School not found: ${schoolId}`)
    }
    if (data.isTestSchool) {
      throw new Error(`${functionName}: ERROR: School is a test school ${schoolId}`)
    }
    const school: School = {
      estabCode: data.estabCode,
      id: data.id,
      laCode: data.leaCode,
      name: data.name,
      slug: data.urlSlug,
      urn: data.urn,
      typeOfEstablishmentCode: data.typeOfEstablishmentCode
    }
    return Object.freeze(school)
  }

  /**
   * Retrieve the input assistant data for the check from the database
   * @param checkId
  */
  public async getInputAssistantData (checkId: number | null): Promise<InputAssistantOrNull> {
    if (checkId === null) {
      return null
    }
    const sql = `
        SELECT
            ia.isRetrospective
          FROM mtc_admin.checkInputAssistant ia
         WHERE ia.check_id = @checkId
    `
    interface DBInputAssistant {
      isRetrospective: boolean
    }

    const res: DBInputAssistant[] = await this.sqlService.query(sql, [{ name: 'checkId', value: checkId, type: TYPES.Int }])
    const data = R.head(res)
    if (data === undefined) {
      return null
    }
    return Object.freeze({
      isRetrospective: data.isRetrospective
    })
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
    return Object.freeze(JSON.parse(data.payload))
  }

  /**
   * Retrieve the check and result from the database
   * @param checkId
   */
  public async getCheck (pupil: Pupil): Promise<CheckOrNull> {
    const checkId = pupil.currentCheckId
    if (checkId === null) {
      // For pupils that have not taken a check, or are not attending
      return null
    }

    // Deal with pupils marked as not attending that may have a currentCheckId
    const maladminAnnulledCode: NotTakingCheckCode = 'ANLLQ'
    const cheatingAnnulledCode: NotTakingCheckCode = 'ANLLH'
    if (pupil.notTakingCheckCode !== null && (pupil.notTakingCheckCode !== maladminAnnulledCode && pupil.notTakingCheckCode !== cheatingAnnulledCode)) {
      return null
    }

    const sql = `
        DECLARE @pupilId INT = (SELECT pupil_id FROM [mtc_admin].[check] WHERE id = @checkId);
        DECLARE @checksLoggedInCount INT = (SELECT count(*) FROM mtc_admin.[check] where isLiveCheck = 1 AND pupil_id = @pupilId AND pupilLoginDate IS NOT NULL);
        DECLARE @restartReasonCode NVARCHAR(50) = NULL;

        IF (@checksLoggedInCount > 1)
          BEGIN
            SET @restartReasonCode = (SELECT TOP 1
                                    rrl.code
                                  FROM
                                    [mtc_admin].[pupilRestart] pr JOIN [mtc_admin].[restartReasonLookup] rrl ON (pr.restartReasonLookup_id = rrl.id)
                                  WHERE
                                    pr.pupil_id = @pupilId
                                  AND
                                    pr.isDeleted = 0
                                  ORDER BY
                                    pr.id DESC) -- grab the latest undeleted restart reason for the pupil
          END


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
            c.pupil_id as pupilId,
            c.received,
            @restartReasonCode as restartReasonCode,
            CASE
              WHEN @checksLoggedInCount > 0 THEN @checksLoggedInCount - 1
              WHEN @checksLoggedInCount = 0 THEN @checksLoggedInCount
            END as restartNumber
          FROM mtc_admin.[check] c
               LEFT JOIN mtc_results.checkResult cr ON (c.id = cr.check_id)
         WHERE c.id = @checkId
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
      pupilId: number
      pupilLoginDate: moment.Moment
      received: boolean
      restartNumber: number
      restartReason: RestartReasonCode | null
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
      restartNumber: data.restartNumber,
      restartReason: data.restartReason
    }

    if (RA.isInteger(check.restartNumber) === true &&
      check.restartNumber > 0 &&
      R.isNil(check.restartReason)) {
      // One or more restarts has been used, but the restart reason was not found using the lookup
      // provided in the `pupilRestart` table.  This can happen when the pin generated after the restart
      // is not used, so it expires.
      // TODO: consider NULLing the pupilRestart.check_id field when the pin is expired, or some other way to
      // maintain this relationship.
      const restartReason = await this.sqlFindRestartReasonCode(data.pupilId, check.restartNumber)
      if (!R.isNil(restartReason)) {
        check.restartReason = restartReason
      }
    }

    return Object.freeze(check)
  }

  /**
   * Retrieve the checkForm from the database or cache
   * @param checkFormId
   */
  public async getCheckForm (checkFormId: number | null): Promise<CheckFormOrNull> {
    if (checkFormId === null) {
      return null
    }

    if (this.checkFormCache.has(checkFormId)) {
      const form = this.checkFormCache.get(checkFormId)
      return form ?? null
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
          FROM mtc_admin.checkForm cf
         WHERE cf.id = @checkFormId
    `
    const res: DBCheckForm[] = await this.sqlService.query(sql, [{ name: 'checkFormId', value: checkFormId, type: TYPES.Int }])
    const data = R.head(res)
    if (data === undefined) {
      throw new Error(`CheckForm ${checkFormId} not found`)
    }
    const formData: Form[] = JSON.parse(data.formData)
    const form: CheckForm = {
      id: data.id,
      name: data.name,
      items: formData.map((o, i) => {
        return { f1: o.f1, f2: o.f2, questionNumber: (i + 1) }
      })
    }
    this.checkFormCache.set(checkFormId, form)
    return Object.freeze(form)
  }

  /**
   * Retrieve the inputs that constitute the answer from the database
   * @param checkId
   */
  public async getInputs (checkId: number): Promise<InputMap> {
    const sql = `
        SELECT a.id as answer_id, ui.userInput, uitl.code as inputType, ui.browserTimestamp
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
      const input: Input = Object.freeze({
        answerId,
        browserTimestamp: o.browserTimestamp,
        input: o.userInput,
        inputType: o.inputType
      })
      const existingInputs = inputMap.get(answerId)
      if (Array.isArray(existingInputs)) {
        inputMap.set(answerId, Object.freeze(R.append(input, existingInputs)))
      } else {
        inputMap.set(answerId, Object.freeze([input]))
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

    // Ensure the output is ordered by question number, so Q1 is at the beginning and Q25 at the end.
    const sql = `
        SELECT
            a.id,
            a.answer,
            q.code as questionCode,
            CONCAT(q.factor1, 'x', q.factor2) as question,
            a.isCorrect,
            a.browserTimestamp,
            a.questionNumber
          FROM mtc_results.checkResult cr
               JOIN mtc_results.answer a ON (cr.id = a.checkResult_id)
               JOIN mtc_admin.question q ON (a.question_id = q.id)
         WHERE cr.check_id = @checkId
         ORDER BY a.questionNumber
    `

    interface DBAnswer {
      id: number
      answer: string
      questionCode: string
      question: string
      isCorrect: boolean
      browserTimestamp: moment.Moment
      questionNumber: number
    }

    const resAnswers: DBAnswer[] = await this.sqlService.query(sql, [{ name: 'checkId', value: checkId, type: TYPES.Int }])
    const inputsMap: InputMap = await this.getInputs(checkId)

    const answers: Answer[] = resAnswers.map(o => {
      const inputs = inputsMap.get(o.id)
      return Object.freeze({
        browserTimestamp: o.browserTimestamp,
        id: o.id,
        inputs: inputs ?? null, // ensure undefined does not get set
        isCorrect: o.isCorrect,
        question: o.question,
        questionCode: o.questionCode,
        questionNumber: o.questionNumber,
        response: o.answer
      })
    })
    return Object.freeze(answers)
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

    /**
     * Note that if there isn't any device information at all, DBDevice[0] will be this:
     *
     * {
     *    browserFamily: null,
     *    browserMajorVersion: null,
     *    browserMinorVersion: null,
     *    browserPatchVersion: null,
     *    ident: null
     * }
     */

    const res: DBDevice[] = await this.sqlService.query(sql, [{ name: 'checkId', value: checkId, type: TYPES.Int }])
    const data = R.head(res)
    if (data === undefined) {
      return null
    }
    const device: Device = Object.freeze({
      browserFamily: data.browserFamily,
      browserMajorVersion: data.browserMajorVersion,
      browserMinorVersion: data.browserMinorVersion,
      browserPatchVersion: data.browserPatchVersion,
      deviceId: data.ident,
      type: null, // TODO: store this at sync time
      typeModel: null // TODO: store this at sync time
    })
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
      const e: Event = Object.freeze({
        browserTimestamp: o.browserTimestamp,
        data: JSON.parse(o.eventData),
        id: o.id,
        isWarmup: o.isWarmup,
        question: o.question,
        questionCode: o.questionCode,
        questionNumber: o.questionNumber,
        type: o.eventType
      })
      return e
    })

    return Object.freeze(events)
  }

  /**
   * Determine if a pupil is not taking a check
   * @param pupil
   * @returns boolean - true if the pupil is marked as not taking the check.
   */
  public pupilIsNotTakingCheck (pupil: Pupil): boolean {
    return pupil.notTakingCheckCode !== null
  }

  /**
   * Bulk fetch check data for multiple pupils in optimized queries
   * Reduces database round trips from 7+ per pupil to ~3 total queries
   */
  public async getBulkCheckData (pupils: readonly Pupil[]): Promise<Map<number, { check: CheckOrNull, config: CheckConfigOrNull, form: CheckFormOrNull, answers: AnswersOrNull, device: DeviceOrNull, events: EventsOrNull, inputAssistant: InputAssistantOrNull }>> {
    const result = new Map<number, any>()

    // Initialize all pupils with null values
    pupils.forEach(p => {
      result.set(p.id, {
        check: null,
        config: null,
        form: null,
        answers: null,
        device: null,
        events: null,
        inputAssistant: null
      })
    })

    // Get all checkIds from pupils
    const checkIds = pupils
      .filter(p => p.currentCheckId !== null)
      .map(p => p.currentCheckId!)

    if (checkIds.length === 0) {
      return result
    }

    // Build dynamic SQL for multiple checkIds
    const checkIdParams: any[] = []
    const checkIdPlaceholders: string[] = []
    checkIds.forEach((checkId, index) => {
      checkIdPlaceholders.push(`@checkId${index}`)
      checkIdParams.push({ name: `checkId${index}`, value: checkId, type: TYPES.Int })
    })

    try {
      // 1. Fetch all check configs in one query
      const configSql = `
        SELECT check_id as checkId, payload
          FROM mtc_admin.checkConfig
         WHERE check_id IN (${checkIdPlaceholders.join(',')})
      `
      const configs = await this.sqlService.query(configSql, checkIdParams)
      const configMap = new Map(configs.map((c: any) => [c.checkId, JSON.parse(c.payload)]))
      this.logger.info(`${functionName}: Retrieved ${configs.length} check configs for ${checkIds.length} checks`)

      // 2. Fetch all checks, forms, and basic info
      const checkSql = `
        SELECT
          c.id as checkId,
          c.pupil_id as pupilId,
          c.checkCode,
          c.checkForm_id,
          cf.name as formName,
          cf.formData,
          c.checkWindow_id,
          c.complete,
          c.completedAt,
          c.inputAssistantAddedRetrospectively,
          c.isLiveCheck,
          cr.mark,
          c.processingFailed,
          c.pupilLoginDate,
          c.received,
          ia.isRetrospective as inputAssistantRetrospective,
          bfl.family as browserFamily,
          ud.browserMajorVersion,
          ud.browserMinorVersion,
          ud.browserPatchVersion,
          ud.ident as deviceId,
          (SELECT COUNT(*) FROM mtc_admin.[check] WHERE isLiveCheck = 1 AND pupil_id = c.pupil_id AND pupilLoginDate IS NOT NULL) - 1 as restartNumber,
          (SELECT TOP 1 rrl.code FROM mtc_admin.pupilRestart pr JOIN mtc_admin.restartReasonLookup rrl ON (pr.restartReasonLookup_id = rrl.id) WHERE pr.pupil_id = c.pupil_id AND pr.isDeleted = 0 ORDER BY pr.id DESC) as restartReasonCode
        FROM mtc_admin.[check] c
          LEFT JOIN mtc_results.checkResult cr ON (c.id = cr.check_id)
          LEFT JOIN mtc_admin.checkForm cf ON (c.checkForm_id = cf.id)
          LEFT JOIN mtc_admin.checkInputAssistant ia ON (c.id = ia.check_id)
          LEFT JOIN mtc_results.userDevice ud ON (cr.userDevice_id = ud.id)
          LEFT JOIN mtc_results.browserFamilyLookup bfl ON (ud.browserFamilyLookup_id = bfl.id)
        WHERE c.id IN (${checkIdPlaceholders.join(',')})
      `
      const checks = await this.sqlService.query(checkSql, checkIdParams)
      this.logger.info(`${functionName}: Retrieved ${checks.length} checks`)

      // 3. Fetch all answers and inputs in one query (with aggregation)
      const answersSql = `
        SELECT
          cr.check_id as checkId,
          a.id,
          a.answer,
          q.code as questionCode,
          CONCAT(q.factor1, 'x', q.factor2) as question,
          a.isCorrect,
          a.browserTimestamp,
          a.questionNumber,
          ui.userInput,
          uitl.code as inputType,
          ui.browserTimestamp as inputTimestamp
        FROM mtc_results.checkResult cr
          JOIN mtc_results.answer a ON (cr.id = a.checkResult_id)
          JOIN mtc_admin.question q ON (a.question_id = q.id)
          LEFT JOIN mtc_results.userInput ui ON (a.id = ui.answer_id)
          LEFT JOIN mtc_results.userInputTypeLookup uitl ON (ui.userInputTypeLookup_id = uitl.id)
        WHERE cr.check_id IN (${checkIdPlaceholders.join(',')})
        ORDER BY cr.check_id, a.questionNumber, ui.browserTimestamp
      `
      const answersData = await this.sqlService.query(answersSql, checkIdParams)

      // 4. Fetch all events in one query
      const eventsSql = `
        SELECT
          cr.check_id as checkId,
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
        WHERE cr.check_id IN (${checkIdPlaceholders.join(',')})
        ORDER BY cr.check_id, e.browserTimestamp
      `
      const events = await this.sqlService.query(eventsSql, checkIdParams)
      this.logger.info(`${functionName}: Retrieved ${events.length} events`)

      // Process and organize the data
      const checkMap = new Map()
      const answersMap = new Map<number, Answer[]>()
      const eventsMap = new Map<number, Event[]>()

      checks.forEach((c: any) => {
        checkMap.set(c.checkId, c)
      })

      answersData.forEach((a: any) => {
        if (!answersMap.has(a.checkId)) {
          answersMap.set(a.checkId, [])
        }
        // Only add unique answers (inputs may duplicate answer rows)
        const existing = answersMap.get(a.checkId)
        if (existing && !existing.find(x => x.id === a.id)) {
          // Build inputs from the query data
          const inputs: Input[] = []
          const inputKey = `input_${a.id}`
          if (a.userInput !== null && a.inputType !== null && a.inputTimestamp !== null) {
            inputs.push(Object.freeze({
              answerId: a.id,
              browserTimestamp: a.inputTimestamp,
              input: a.userInput,
              inputType: a.inputType
            }))
          }
          
          existing.push(Object.freeze({
            browserTimestamp: a.browserTimestamp,
            id: a.id,
            inputs: inputs.length > 0 ? Object.freeze(inputs) : null,
            isCorrect: a.isCorrect,
            question: a.question,
            questionCode: a.questionCode,
            questionNumber: a.questionNumber,
            response: a.answer
          }))
        }
      })

      events.forEach((e: any) => {
        if (!eventsMap.has(e.checkId)) {
          eventsMap.set(e.checkId, [])
        }
        const eventsList = eventsMap.get(e.checkId)
        if (eventsList) {
          eventsList.push(Object.freeze({
            browserTimestamp: e.browserTimestamp,
            data: JSON.parse(e.eventData),
            id: e.id,
            isWarmup: e.isWarmup,
            question: e.question,
            questionCode: e.questionCode,
            questionNumber: e.questionNumber,
            type: e.eventType
          }))
        }
      })

      // Now populate the result map with processed data
      pupils.forEach(pupil => {
        if (pupil.currentCheckId !== null && checkMap.has(pupil.currentCheckId)) {
          const checkData = checkMap.get(pupil.currentCheckId)
          const checkId = pupil.currentCheckId

          // Build check object with restart data
          const check: Check = {
            checkCode: checkData.checkCode,
            checkFormId: checkData.checkForm_id,
            checkWindowId: checkData.checkWindow_id,
            complete: checkData.complete,
            completedAt: checkData.completedAt,
            id: checkData.checkId,
            inputAssistantAddedRetrospectively: checkData.inputAssistantAddedRetrospectively,
            isLiveCheck: checkData.isLiveCheck,
            mark: checkData.mark,
            processingFailed: checkData.processingFailed,
            pupilLoginDate: checkData.pupilLoginDate,
            received: checkData.received,
            restartNumber: checkData.restartNumber ?? 0,
            restartReason: checkData.restartReasonCode ?? null
          }

          // Build form object
          let form: CheckFormOrNull = null
          if (checkData.formName !== null) {
            const formData = JSON.parse(checkData.formData)
            form = Object.freeze({
              id: checkData.checkForm_id,
              name: checkData.formName,
              items: formData.map((o: any, i: number) => ({
                f1: o.f1,
                f2: o.f2,
                questionNumber: i + 1
              }))
            })
            this.checkFormCache.set(checkData.checkForm_id, form)
          }

          // Build device object
          let device: DeviceOrNull = null
          if (checkData.deviceId !== null || checkData.browserFamily !== null) {
            device = Object.freeze({
              browserFamily: checkData.browserFamily,
              browserMajorVersion: checkData.browserMajorVersion,
              browserMinorVersion: checkData.browserMinorVersion,
              browserPatchVersion: checkData.browserPatchVersion,
              deviceId: checkData.deviceId,
              type: null,
              typeModel: null
            })
          }

          // Build input assistant object
          let inputAssistant: InputAssistantOrNull = null
          if (checkData.inputAssistantRetrospective !== null) {
            inputAssistant = Object.freeze({
              isRetrospective: checkData.inputAssistantRetrospective
            })
          }

          result.set(pupil.id, {
            check: Object.freeze(check),
            config: configMap.get(checkId) ?? null,
            form,
            answers: answersMap.get(checkId) ? Object.freeze(answersMap.get(checkId)) : null,
            device,
            events: eventsMap.get(checkId) ? Object.freeze(eventsMap.get(checkId)) : null,
            inputAssistant
          })
        }
      })
    }

    // Log summary of what was processed
    const resultsWithData = Array.from(result.values()).filter(r => r.check !== null)
    this.logger.info(`${functionName}: getBulkCheckData completed: ${resultsWithData.length} pupils with check data out of ${pupils.length} total pupils`)

    return result
  }

  /**
   * Entry point to create the data structure to pass to the transform step in the psychometric report generation
   * @param pupil
   */
  public async getPupilData (pupil: Pupil, school: School): Promise<PupilResult> {
    try {
      const promises: [
        Promise<CheckConfigOrNull>,
        Promise<CheckOrNull>,
        Promise<AnswersOrNull>,
        Promise<DeviceOrNull>,
        Promise<EventsOrNull>,
        Promise<InputAssistantOrNull>
      ] = [
        this.getCheckConfig(pupil.currentCheckId),
        this.getCheck(pupil),
        this.getAnswers(pupil.currentCheckId),
        this.getDevice(pupil.currentCheckId),
        this.getEvents(pupil.currentCheckId),
        this.getInputAssistantData(pupil.currentCheckId)
      ]
      const [checkConfig, check, answers, device, events, inputAssistant] = await Promise.all(promises)
      let checkForm: CheckFormOrNull = null
      if (check !== null) {
        checkForm = await this.getCheckForm(check.checkFormId)
      }
      return Object.freeze({
        pupil,
        school,
        checkConfig,
        check,
        checkForm,
        answers,
        device,
        events,
        inputAssistant
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`${functionName}: getPupilData() failed for pupil ${pupil.id}: ${errorMsg}`)
      throw error
    }
  }
}

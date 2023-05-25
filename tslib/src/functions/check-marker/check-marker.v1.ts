import * as RA from 'ramda-adjunct'
import * as R from 'ramda'
import { type ReceivedCheckFunctionBindingEntity } from '../../schemas/models'
import moment from 'moment'
import { type ICheckFormService, CheckFormService } from '../../services/check-form.service'
import { type ILogger } from '../../common/logger'
import { type ICheckMarkerFunctionBindings, type MarkingData, type CheckResult, type MarkedAnswer } from './models'
import { type ICheckNotificationMessage, CheckNotificationType } from '../../schemas/check-notification-message'
import { type ITableService, TableService } from '../../azure/table-service'
import { ReceivedCheckBindingEntityTransformer } from '../../services/receivedCheckBindingEntityTransformer'

export class CheckMarkerV1 {
  private readonly tableService: ITableService
  private readonly sqlService: ICheckFormService
  private readonly receivedCheckTransformer: ReceivedCheckBindingEntityTransformer

  constructor (tableService?: ITableService, sqlService?: ICheckFormService) {
    if (tableService === undefined) {
      this.tableService = new TableService()
    } else {
      this.tableService = tableService
    }

    if (sqlService === undefined) {
      this.sqlService = new CheckFormService()
    } else {
      this.sqlService = sqlService
    }
    this.receivedCheckTransformer = new ReceivedCheckBindingEntityTransformer()
  }

  /**
   * This is the main entry-point called from index.ts
   * @param functionBindings
   * @param logger
   */
  async mark (functionBindings: ICheckMarkerFunctionBindings, logger: ILogger): Promise<void> {
    logger.verbose('mark() called')
    const validatedCheck = this.findValidatedCheck(functionBindings.receivedCheckTable)
    const markingData = await this.validateData(validatedCheck, logger)
    functionBindings.checkResultTable = []
    functionBindings.checkNotificationQueue = []

    if (markingData === undefined) {
      this.notifyProcessingFailure(validatedCheck, functionBindings)
      return
    }
    let checkResult: CheckResult
    try {
      checkResult = this.markCheck(markingData, validatedCheck.RowKey)
      logger.verbose(`mark(): results ${JSON.stringify(checkResult)}`)
      this.persistMark(checkResult, functionBindings, validatedCheck.PartitionKey)
    } catch (error) {
      this.notifyProcessingFailure(validatedCheck, functionBindings)
      return
    }
    const notification: ICheckNotificationMessage = {
      checkCode: validatedCheck.RowKey,
      notificationType: CheckNotificationType.checkComplete,
      version: 1
    }
    logger.verbose(`mark() setting notification msg to ${JSON.stringify(notification)}`)
    functionBindings.checkNotificationQueue.push(notification)
  }

  private notifyProcessingFailure (validatedCheck: ReceivedCheckFunctionBindingEntity, functionBindings: ICheckMarkerFunctionBindings): void {
    const notification: ICheckNotificationMessage = {
      checkCode: validatedCheck.RowKey,
      notificationType: CheckNotificationType.checkInvalid,
      version: 1
    }
    functionBindings.checkNotificationQueue.push(notification)
  }

  private async validateData (validatedCheck: ReceivedCheckFunctionBindingEntity, logger: ILogger): Promise<MarkingData | undefined> {
    if (RA.isNilOrEmpty(validatedCheck.answers)) {
      await this.updateReceivedCheckWithMarkingError(validatedCheck, 'answers property not populated')
      return
    }
    let parsedAnswersJson: any
    try {
      // tsc does not recognise the RA.IsNilOrEmpty check above
      // therefore we use the exclamation to assert non null guarantee
      // @ts-ignore Ramda does not work well with type checking
      parsedAnswersJson = JSON.parse(validatedCheck.answers)
    } catch (error) {
      logger.error(error)
      await this.updateReceivedCheckWithMarkingError(validatedCheck, 'answers data is not valid JSON')
      return
    }

    if (!RA.isArray(parsedAnswersJson)) {
      await this.updateReceivedCheckWithMarkingError(validatedCheck, 'answers data is not an array')
      return
    }

    // Sort the answers by clientTimeStamp, so that we get a sequential timeline of events
    const sortedAnswers = this.answerSort(parsedAnswersJson)

    const checkCode = validatedCheck.RowKey
    let rawCheckForm

    try {
      rawCheckForm = await this.sqlService.getCheckFormDataByCheckCode(checkCode)
    } catch (error) {
      logger.error(error)
      await this.updateReceivedCheckWithMarkingError(validatedCheck, `checkForm lookup failed:${error.message}`)
      return
    }

    if (R.isNil(rawCheckForm)) {
      await this.updateReceivedCheckWithMarkingError(validatedCheck, 'associated checkForm could not be found by checkCode')
      return
    }

    let checkForm: any

    try {
      checkForm = JSON.parse(rawCheckForm)
    } catch (error) {
      logger.error(error)
      await this.updateReceivedCheckWithMarkingError(validatedCheck, 'associated checkForm data is not valid JSON')
      return
    }

    if (!RA.isArray(checkForm) || RA.isEmptyArray(checkForm)) {
      await this.updateReceivedCheckWithMarkingError(validatedCheck, 'check form data is either empty or not an array')
      return
    }

    const toReturn: MarkingData = {
      answers: sortedAnswers,
      formQuestions: checkForm,
      results: []
    }
    return toReturn
  }

  private markCheck (markingData: MarkingData, checkCode: string): CheckResult {
    const results: CheckResult = {
      mark: 0,
      checkCode,
      maxMarks: markingData.formQuestions.length,
      markedAnswers: [],
      markedAt: moment.utc().toDate() // even using the entityGenerator it appears to be impossible to make this a date in table storage
      // this message is a warning for people in the future not to waste their time here.
    }

    let questionNumber = 1
    for (const question of markingData.formQuestions) {
      const answerRecord = markingData.answers.find(o => o.sequenceNumber === questionNumber &&
        o.factor1 === question.f1 &&
        o.factor2 === question.f2)

      const markedAnswer: MarkedAnswer = {
        factor1: question.f1,
        factor2: question.f2,
        answer: '',
        sequenceNumber: questionNumber,
        question: `${question.f1}x${question.f2}`,
        clientTimestamp: '',
        isCorrect: false
      }

      if (answerRecord !== undefined) {
        markedAnswer.answer = answerRecord.answer
        markedAnswer.clientTimestamp = answerRecord.clientTimestamp
        if (answerRecord.monotonicTime !== undefined) {
          markedAnswer.monotonicTime = {}
          if (answerRecord.monotonicTime.milliseconds !== undefined) {
            markedAnswer.monotonicTime.milliseconds = answerRecord.monotonicTime.milliseconds
          }
          if (answerRecord.monotonicTime.sequenceNumber !== undefined) {
            markedAnswer.monotonicTime.sequenceNumber = answerRecord.monotonicTime.sequenceNumber
          }
          if (answerRecord.monotonicTime.legacyDate !== undefined) {
            markedAnswer.monotonicTime.legacyDate = answerRecord.monotonicTime.legacyDate
          }
        }
      }
      const answer = answerRecord?.answer ?? ''

      if (answer !== '' && question.f1 * question.f2 === parseInt(answer, 10)) {
        markedAnswer.isCorrect = true
      } else {
        markedAnswer.isCorrect = false
      }
      results.markedAnswers.push(markedAnswer)
      questionNumber += 1
    }

    results.mark = results.markedAnswers.filter(o => o.isCorrect).length
    return results
  }

  private persistMark (checkResult: CheckResult, functionBindings: ICheckMarkerFunctionBindings, schoolUUID: string): void {
    if (functionBindings.checkResultTable === undefined) {
      functionBindings.checkResultTable = []
    }
    const markingEntity: any = R.omit(['checkCode'], checkResult)
    markingEntity.PartitionKey = schoolUUID
    markingEntity.RowKey = checkResult.checkCode
    functionBindings.checkResultTable.push(markingEntity)
  }

  private findValidatedCheck (receivedCheckRef: any[]): ReceivedCheckFunctionBindingEntity {
    if (RA.isEmptyArray(receivedCheckRef)) {
      throw new Error('received check reference is empty')
    }
    return receivedCheckRef[0]
  }

  private async updateReceivedCheckWithMarkingError (receivedCheck: ReceivedCheckFunctionBindingEntity, markingError: string): Promise<void> {
    const transformedEntity = this.receivedCheckTransformer.transform(receivedCheck)
    transformedEntity.processingError = markingError
    transformedEntity.markedAt = moment().toDate()
    return this.tableService.mergeUpdateEntity('receivedCheck', transformedEntity)
  }

  private answerSort (answers: MarkedAnswer[]): MarkedAnswer[] {
    if (!RA.isArray(answers)) {
      throw new Error('answers is not an array')
    }
    const cmp = (a: MarkedAnswer, b: MarkedAnswer): number => {
      const aDate = new Date(a.clientTimestamp)
      const bDate = new Date(b.clientTimestamp)
      if (aDate < bDate) {
        return -1
      } else if (aDate.getTime() === bDate.getTime()) {
        if (a?.monotonicTime?.sequenceNumber !== undefined && b?.monotonicTime?.sequenceNumber !== undefined) {
          return a.monotonicTime.sequenceNumber - b.monotonicTime.sequenceNumber
        } else {
          return 0
        }
      }
      return 1
    }
    return R.sort(cmp, answers)
  }
}

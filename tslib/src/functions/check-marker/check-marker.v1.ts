import * as R from 'ramda'
import { type ReceivedCheckFunctionBindingEntity } from '../../schemas/models'
import moment from 'moment'
import { type ICheckFormService, CheckFormService } from '../../services/check-form.service'
import { type ILogger } from '../../common/logger'
import type { MarkingData, CheckResult, MarkedAnswer, ICheckMarkerOutputs, IMarkingEntity } from './models'
import { type ICheckNotificationMessage, CheckNotificationType } from '../../schemas/check-notification-message'
import { type ITableService, TableService } from '../../azure/table-service'
import { ReceivedCheckBindingEntityTransformer } from '../../services/receivedCheckBindingEntityTransformer'
const RA = require('ramda-adjunct')

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
   * @param receivedCheckEntry
   * @param logger
   */
  async mark (receivedCheckEntry: unknown, logger: ILogger): Promise<ICheckMarkerOutputs> {
    const validatedCheck = this.findValidatedCheck(receivedCheckEntry)
    const markingData = await this.validateData(validatedCheck, logger)
    const outputs: ICheckMarkerOutputs = {
      checkNotificationQueue: [],
      checkResultTable: []
    }

    if (markingData === undefined) {
      const failure = this.createProcessingFailureMessage(validatedCheck)
      outputs.checkNotificationQueue.push(failure)
      return outputs
    }
    let checkResult: CheckResult
    try {
      checkResult = this.markCheck(markingData, validatedCheck.RowKey)
      const markingEntity = this.createMarkingEntity(checkResult, validatedCheck.PartitionKey)
      outputs.checkResultTable.push(markingEntity)
    } catch {
      const failure = this.createProcessingFailureMessage(validatedCheck)
      outputs.checkNotificationQueue.push(failure)
      return outputs
    }
    const notification: ICheckNotificationMessage = {
      checkCode: validatedCheck.RowKey,
      notificationType: CheckNotificationType.checkComplete,
      version: 1
    }
    outputs.checkNotificationQueue.push(notification)
    return outputs
  }

  private createProcessingFailureMessage (validatedCheck: ReceivedCheckFunctionBindingEntity): ICheckNotificationMessage {
    const notification: ICheckNotificationMessage = {
      checkCode: validatedCheck.RowKey,
      notificationType: CheckNotificationType.checkInvalid,
      version: 1
    }
    return notification
  }

  private async validateData (validatedCheck: ReceivedCheckFunctionBindingEntity, logger: ILogger): Promise<MarkingData | undefined> {
    if (RA.isNilOrEmpty(validatedCheck.answers) === true) {
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

    if (RA.isArray(parsedAnswersJson) === false) {
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
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      await this.updateReceivedCheckWithMarkingError(validatedCheck, `checkForm lookup failed:${errorMessage}`)
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

    if (RA.isArray(checkForm) === false || RA.isEmptyArray(checkForm) === true) {
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

  private createMarkingEntity (checkResult: CheckResult, schoolUUID: string): IMarkingEntity {
    const markingEntity: any = R.omit(['checkCode'], checkResult)
    markingEntity.PartitionKey = schoolUUID
    markingEntity.RowKey = checkResult.checkCode
    return markingEntity
  }

  private findValidatedCheck (receivedCheckRef: unknown): ReceivedCheckFunctionBindingEntity {
    if (RA.isEmptyArray(receivedCheckRef) === true) {
      throw new Error('received check reference is empty')
    }
    if (RA.isArray(receivedCheckRef) === false) {
      return receivedCheckRef as ReceivedCheckFunctionBindingEntity
    }
    const checkArray = receivedCheckRef as ReceivedCheckFunctionBindingEntity[]
    return checkArray[0]
  }

  private async updateReceivedCheckWithMarkingError (receivedCheck: ReceivedCheckFunctionBindingEntity, markingError: string): Promise<void> {
    const transformedEntity = this.receivedCheckTransformer.transform(receivedCheck)
    transformedEntity.processingError = markingError
    transformedEntity.markedAt = moment().toDate()
    return this.tableService.mergeUpdateEntity('receivedCheck', transformedEntity)
  }

  private answerSort (answers: MarkedAnswer[]): MarkedAnswer[] {
    if (RA.isArray(answers) === false) {
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

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'
import { IAsyncTableService, AsyncTableService, TableStorageEntity } from '../../azure/storage-helper'
import { ReceivedCheckTableEntity } from '../../schemas/models'
import moment from 'moment'
import { ICheckFormService, CheckFormService } from './check-form.service'
import { ILogger } from '../../common/logger'
import { ICheckMarkerFunctionBindings, MarkingData, CheckResult, MarkedAnswer } from './models'
import { ICheckNotificationMessage, CheckNotificationType } from '../check-notifier/check-notification-message'
import { ICompressionService, CompressionService } from '../../common/compression-service'

const functionName = 'check-marker'

export class CheckMarkerV1 {
  private readonly tableService: IAsyncTableService
  private readonly sqlService: ICheckFormService
  private readonly compressionService: ICompressionService

  constructor (tableService?: IAsyncTableService, sqlService?: ICheckFormService, compressionService?: ICompressionService) {
    if (tableService === undefined) {
      this.tableService = new AsyncTableService()
    } else {
      this.tableService = tableService
    }

    if (sqlService === undefined) {
      this.sqlService = new CheckFormService()
    } else {
      this.sqlService = sqlService
    }

    if (compressionService === undefined) {
      this.compressionService = new CompressionService()
    } else {
      this.compressionService = compressionService
    }
  }

  /**
   * This is the main entry-point called from index.ts
   * @param functionBindings
   * @param logger
   */
  async mark (functionBindings: ICheckMarkerFunctionBindings, logger: ILogger): Promise<void> {
    logger.verbose('mark() called')
    const validatedCheck = this.findValidatedCheck(functionBindings.receivedCheckTable)
    const markingData = await this.validateData(functionBindings, validatedCheck, logger)
    functionBindings.checkResultTable = []
    functionBindings.checkNotificationQueue = []
    functionBindings.checkCompletionQueue = []
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

    // Output the markedCheck and the payload to be sent to the results schema
    const hasArchiveProperty = Object.prototype.hasOwnProperty.call(validatedCheck, 'archive')
    if (hasArchiveProperty) {
      try {
        const payloadString = this.compressionService.decompress(validatedCheck.archive)
        const payload = JSON.parse(payloadString)
        logger.verbose('mark() setting data for results processing on check-completion queue')
        functionBindings.checkCompletionQueue.push({
          validatedCheck: payload,
          markedCheck: checkResult
        })
      } catch (error) {
        console.error(error)
        logger.error(`${functionName}: checkCode [${validatedCheck.RowKey}] failed to send data to results queue: ${error.message}`)
      }
    } else {
      console.error('No archive')
      logger.error(`${functionName}: checkCode [${validatedCheck.RowKey}] failed to detect an archive property.  Results are not available.`)
    }
  }

  private notifyProcessingFailure (validatedCheck: ReceivedCheckTableEntity, functionBindings: ICheckMarkerFunctionBindings): void {
    const notification: ICheckNotificationMessage = {
      checkCode: validatedCheck.RowKey,
      notificationType: CheckNotificationType.checkInvalid,
      version: 1
    }
    functionBindings.checkNotificationQueue.push(notification)
  }

  private async validateData (functionBindings: ICheckMarkerFunctionBindings, validatedCheck: ReceivedCheckTableEntity, logger: ILogger): Promise<MarkingData | undefined> {
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
      checkCode: checkCode,
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

  private findValidatedCheck (receivedCheckRef: any[]): ReceivedCheckTableEntity {
    if (RA.isEmptyArray(receivedCheckRef)) {
      throw new Error('received check reference is empty')
    }
    return receivedCheckRef[0]
  }

  private async updateReceivedCheckWithMarkingError (receivedCheck: ReceivedCheckTableEntity, markingError: string): Promise<Error | TableStorageEntity> {
    receivedCheck.processingError = markingError
    receivedCheck.markedAt = moment().toDate()
    return this.tableService.replaceEntityAsync('receivedCheck', receivedCheck)
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
        return 0
      }
      return 1
    }
    return R.sort(cmp, answers)
  }
}

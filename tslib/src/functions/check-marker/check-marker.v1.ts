import * as RA from 'ramda-adjunct'
import * as R from 'ramda'
import * as uuid from 'uuid'
import { IAsyncTableService, AsyncTableService } from '../../azure/storage-helper'
import { ReceivedCheckTableEntity } from '../../schemas/models'
import moment from 'moment'
import { ICheckFormService, CheckFormService } from './check-form.service'
import { ILogger } from '../../common/logger'
import { ICheckMarkerFunctionBindings, MarkingData, CheckResult } from './models'
import { ICheckNotificationMessage, CheckNotificationType } from '../check-notifier/check-notification-message'

export class CheckMarkerV1 {
  private tableService: IAsyncTableService
  private sqlService: ICheckFormService

  constructor (tableService?: IAsyncTableService, sqlService?: ICheckFormService) {
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
  }

  async mark (functionBindings: ICheckMarkerFunctionBindings, logger: ILogger): Promise<void> {
    logger.verbose('mark() called')
    const validatedCheck = this.findValidatedCheck(functionBindings.receivedCheckTable)
    const markingData = await this.validateData(functionBindings, validatedCheck, logger)
    functionBindings.checkResultTable = []
    functionBindings.checkNotificationQueue = []
    if (markingData === undefined) {
      this.notifyProcessingFailure(validatedCheck, functionBindings)
      return
    }
    try {
      const checkResult = this.markCheck(markingData, validatedCheck.RowKey)
      logger.verbose(`mark(): results ${JSON.stringify(checkResult)}`)
      this.persistMark(checkResult, functionBindings)
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

  private notifyProcessingFailure (validatedCheck: ReceivedCheckTableEntity, functionBindings: ICheckMarkerFunctionBindings) {
    const notification: ICheckNotificationMessage = {
      checkCode: validatedCheck.RowKey,
      notificationType: CheckNotificationType.checkInvalid,
      version: 1
    }
    functionBindings.checkNotificationQueue.push(notification)
  }

  private async validateData (functionBindings: ICheckMarkerFunctionBindings, validatedCheck: ReceivedCheckTableEntity, logger: ILogger): Promise<MarkingData | void> {
    if (RA.isNilOrEmpty(validatedCheck.answers)) {
      await this.updateReceivedCheckWithMarkingError(validatedCheck, 'answers property not populated')
      return
    }
    let parsedAnswersJson: any
    try {
      // tsc does not recognise the RA.IsNilOrEmpty check above
      // therefore we use the exclamation to assert non null guarantee
      parsedAnswersJson = JSON.parse(validatedCheck.answers!)
    } catch (error) {
      logger.error(error)
      return this.updateReceivedCheckWithMarkingError(validatedCheck, 'answers data is not valid JSON')
    }

    if (!RA.isArray(parsedAnswersJson)) {
      return this.updateReceivedCheckWithMarkingError(validatedCheck, 'answers data is not an array')
    }

    const checkCode = validatedCheck.RowKey
    let rawCheckForm

    try {
      // TODO: jms move this to a service that checks redis first
      rawCheckForm = await this.sqlService.getCheckFormDataByCheckCode(checkCode)
    } catch (error) {
      logger.error(error)
      return this.updateReceivedCheckWithMarkingError(validatedCheck, `checkForm lookup failed:${error.message}`)
    }

    if (R.isNil(rawCheckForm)) {
      return this.updateReceivedCheckWithMarkingError(validatedCheck, 'associated checkForm could not be found by checkCode')
    }

    let checkForm: any

    try {
      checkForm = JSON.parse(rawCheckForm)
    } catch (error) {
      logger.error(error)
      return this.updateReceivedCheckWithMarkingError(validatedCheck, 'associated checkForm data is not valid JSON')
    }

    if (!RA.isArray(checkForm) || RA.isEmptyArray(checkForm)) {
      return this.updateReceivedCheckWithMarkingError(validatedCheck, 'check form data is either empty or not an array')
    }

    const toReturn: MarkingData = {
      answers: parsedAnswersJson,
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
      markedAt: moment.utc().toDate() // TODO: jms: this is converted to a string in table storage 🙈
    }

    let questionNumber = 1
    for (let question of markingData.formQuestions) {
      const currentIndex = questionNumber - 1
      const answerRecord = markingData.answers[currentIndex] // TODO JMS: find the answers as per the spec
      const markedAnswer = { ...answerRecord } // clone
      const answer = (answerRecord && answerRecord.answer) || ''
      questionNumber += 1

      if (answer && question.f1 * question.f2 === parseInt(answer, 10)) {
        markedAnswer.isCorrect = true
      } else {
        markedAnswer.isCorrect = false
      }
      results.markedAnswers.push(markedAnswer)
    }
    results.mark = results.markedAnswers.filter(o => o.isCorrect === true).length
    return results
  }

  private persistMark (checkResult: CheckResult, functionBindings: ICheckMarkerFunctionBindings) {
    if (!functionBindings.checkResultTable) {
      functionBindings.checkResultTable = []
    }
    const markingEntity: any = R.omit(['checkCode'], checkResult)
    markingEntity.PartitionKey = checkResult.checkCode
    markingEntity.RowKey = uuid.v4()
    functionBindings.checkResultTable.push(markingEntity)
  }

  private findValidatedCheck (receivedCheckRef: Array<any>): ReceivedCheckTableEntity {
    if (RA.isEmptyArray(receivedCheckRef)) {
      throw new Error('received check reference is empty')
    }
    return receivedCheckRef[0]
  }

  private async updateReceivedCheckWithMarkingError (receivedCheck: ReceivedCheckTableEntity, markingError: string) {
    receivedCheck.processingError = markingError
    receivedCheck.markedAt = moment().toDate()
    return this.tableService.replaceEntityAsync('receivedCheck', receivedCheck)
  }
}

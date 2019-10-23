import * as RA from 'ramda-adjunct'
import * as R from 'ramda'
import { IAsyncTableService, AsyncTableService } from '../../azure/async-table-service'
import { ValidatedCheck } from '../../schemas/index'
import moment from 'moment'
import { ICheckFormService, CheckFormService } from './check-form.service'
import { ILogger } from '../../common/ILogger'
import { ICheckMarkerFunctionBindings, MarkingData, Mark } from './Models'

export class CheckMarkerV1 {

  private _tableService: IAsyncTableService
  private _sqlService: ICheckFormService

  constructor (tableService?: IAsyncTableService, sqlService?: ICheckFormService) {
    if (tableService === undefined) {
      this._tableService = new AsyncTableService()
    } else {
      this._tableService = tableService
    }

    if (sqlService === undefined) {
      this._sqlService = new CheckFormService()
    } else {
      this._sqlService = sqlService
    }
  }

  async mark (functionBindings: ICheckMarkerFunctionBindings, logger: ILogger): Promise<void> {

    const validatedCheck = this.findValidatedCheck(functionBindings.receivedCheckTable)
    const markingData = await this.validateData(functionBindings, validatedCheck, logger)
    functionBindings.checkNotificationQueue = []
    if (markingData === undefined) {
      functionBindings.checkNotificationQueue.push({
        checkCode: validatedCheck.RowKey,
        type: 'unmarkable'
      })
      return
    }
    const results = this.markCheck(markingData)
    await this.persistMark(results, validatedCheck)
    functionBindings.checkNotificationQueue.push({
      checkCode: validatedCheck.RowKey,
      type: 'marked'
    })
  }

  private async validateData (functionBindings: ICheckMarkerFunctionBindings, validatedCheck: ValidatedCheck, logger: ILogger): Promise<MarkingData | void> {
    if (RA.isEmptyString(validatedCheck.answers)) {
      await this.updateReceivedCheckWithMarkingError(validatedCheck, 'answers property not populated')
      return
    }

    let parsedAnswersJson: any
    try {
      parsedAnswersJson = JSON.parse(validatedCheck.answers)
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
      rawCheckForm = await this._sqlService.getCheckFormDataByCheckCode(checkCode)
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

  private markCheck (markingData: MarkingData): Mark {
    const results: Mark = {
      mark: 0,
      maxMarks: markingData.formQuestions.length,
      processedAt: moment.utc().toDate()
    }

    let questionNumber = 1
    for (let question of markingData.formQuestions) {
      const currentIndex = questionNumber - 1
      const answerRecord = markingData.answers[currentIndex]
      const answer = (answerRecord && answerRecord.answer) || ''
      questionNumber += 1

      if (answer && question.f1 * question.f2 === parseInt(answer, 10)) {
        results.mark += 1
      }
    }
    return results
  }

  private async persistMark (mark: Mark, receivedCheck: ValidatedCheck) {
    receivedCheck.mark = mark.mark
    receivedCheck.markedAt = mark.processedAt
    receivedCheck.maxMarks = mark.maxMarks
    return this._tableService.replaceEntityAsync('receivedCheck', receivedCheck)
  }

  private findValidatedCheck (receivedCheckRef: Array<any>): ValidatedCheck {
    if (RA.isEmptyArray(receivedCheckRef)) {
      throw new Error('received check reference is empty')
    }
    return receivedCheckRef[0]
  }

  private async updateReceivedCheckWithMarkingError (receivedCheck: ValidatedCheck, markingError: string) {
    receivedCheck.markError = markingError
    receivedCheck.markedAt = moment().toDate()
    return this._tableService.replaceEntityAsync('receivedCheck', receivedCheck)
  }
}

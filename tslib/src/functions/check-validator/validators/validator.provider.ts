import { AnswerCountValidator } from './answer-count.validator.js'
import { AnswerTypeValidator } from './answer-type.validator.js'
import { CheckCodeValidator } from './check-code.validator.js'
import { CheckConfigValidator } from './check-config.validator.js'
import { AnswersValidator } from './answers.validator.js'
import { AuditValidator } from './audit.validator.js'
import { InputsValidator } from './inputs.validator.js'
import { PupilValidator } from './pupil.validator.js'
import { QuestionsValidator } from './questions.validator.js'
import { SchoolValidator } from './school.validator.js'
import { TokensValidator } from './tokens.validator.js'
import { LiveCheckValidator } from './live-check.validator.js'
import { type ISubmittedCheckValidator, type IAsyncSubmittedCheckValidator } from './validator-types.js'
import { AnswerCountCheckFormValidator } from './answer-count-check-form.validator.js'
import { CheckFormService, type ICheckFormService } from '../../../services/check-form.service.js'

export interface IValidatorProvider {
  getValidators (): ISubmittedCheckValidator[]
  getAsyncValidators (): IAsyncSubmittedCheckValidator[]
}

export class ValidatorProvider {
  private readonly checkFormService: ICheckFormService

  constructor (checkFormService?: ICheckFormService) {
    this.checkFormService = checkFormService ?? new CheckFormService()
  }

  getValidators (): ISubmittedCheckValidator[] {
    return [
      new AnswerCountValidator(),
      new AnswerTypeValidator(),
      new AnswersValidator(),
      new AuditValidator(),
      new CheckCodeValidator(),
      new CheckConfigValidator(),
      new InputsValidator(),
      new LiveCheckValidator(),
      new PupilValidator(),
      new QuestionsValidator(),
      new SchoolValidator(),
      new TokensValidator()
    ]
  }

  /**
   * Async validators may perform network IO, and should be called after the synchronous validators
   */
  getAsyncValidators (): IAsyncSubmittedCheckValidator[] {
    return [
      new AnswerCountCheckFormValidator(this.checkFormService)
    ]
  }
}

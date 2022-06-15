import { AnswerCountValidator } from './answer-count.validator'
import { AnswerTypeValidator } from './answer-type.validator'
import { CheckCodeValidator } from './check-code.validator'
import { CheckConfigValidator } from './check-config.validator'
import { AnswersValidator } from './answers.validator'
import { AuditValidator } from './audit.validator'
import { InputsValidator } from './inputs.validator'
import { PupilValidator } from './pupil.validator'
import { QuestionsValidator } from './questions.validator'
import { SchoolValidator } from './school.validator'
import { TokensValidator } from './tokens.validator'
import { LiveCheckValidator } from './live-check.validator'
import { ISubmittedCheckValidator, IAsyncSubmittedCheckValidator } from './validator-types'
import { AnswerCountCheckFormValidator } from './answer-count-check-form.validator'

export class ValidatorProvider {
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
   * Async validators may perform network IO, and should be called after the non-async validators
   */
  getAsyncValidators (): IAsyncSubmittedCheckValidator[] {
    return [
      new AnswerCountCheckFormValidator()
    ]
  }
}

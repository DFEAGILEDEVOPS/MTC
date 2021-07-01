import { CheckQuestion, CompleteCheckAuditEntry } from '../../schemas/check-schemas/submitted-check'
import moment from 'moment'

export class CompletedCheckAuditBuilderService {
  createAudits (questions: CheckQuestion[]): CompleteCheckAuditEntry[] {
    return [...this.buildWarmupEntries(), ...this.buildQuestionEntries(questions), ...this.buildSubmissionEntries()]
  }

  private buildSubmissionEntries (): CompleteCheckAuditEntry[] {
    // TODO
    return []
  }

  private buildQuestionEntries (questions: CheckQuestion[]): CompleteCheckAuditEntry[] {
    // TODO
    return []
  }

  private readonly warmupQuestions: CheckQuestion[] = [
    {
      factor1: 1,
      factor2: 5,
      order: 1
    },
    {
      factor1: 3,
      factor2: 3,
      order: 2
    },
    {
      factor1: 5,
      factor2: 5,
      order: 3
    }
  ]

  private buildWarmupEntries (): CompleteCheckAuditEntry[] {
    const header: CompleteCheckAuditEntry[] = [{
      type: 'WarmupStarted',
      clientTimestamp: moment().add(1, 'seconds').toISOString(),
      relativeTiming: '+0'
    },
    {
      type: 'WarmupIntroRendered',
      clientTimestamp: moment().add(2, 'seconds').toISOString(),
      relativeTiming: '+0'
    }]
    const warmupAnswers = new Array<CompleteCheckAuditEntry>()
    for (let index = 0; index < this.warmupQuestions.length; index++) {
      const q = this.warmupQuestions[index]
      warmupAnswers.push(...this.buildWarmupQuestionEntries(q))
    }
    const footer: CompleteCheckAuditEntry = {
      type: 'WarmupCompleteRendered',
      clientTimestamp: moment().toISOString(),
      relativeTiming: '+0'
    }
    return [...header, ...warmupAnswers, footer]
  }

  private buildWarmupQuestionEntries (question: CheckQuestion): CompleteCheckAuditEntry[] {
    const data = {
      sequenceNumber: question.order,
      question: `${question.factor1}x${question.factor2}`,
      isWarmup: true
    }
    return [
      {
        clientTimestamp: moment().toISOString(),
        relativeTiming: '+0',
        type: 'PauseRendered',
        data: data
      },
      {
        clientTimestamp: moment().toISOString(),
        relativeTiming: '+0',
        type: 'QuestionTimerStarted',
        data: data
      },
      {
        clientTimestamp: moment().toISOString(),
        relativeTiming: '+0',
        type: 'QuestionRendered',
        data: data
      },
      {
        clientTimestamp: moment().toISOString(),
        relativeTiming: '+0',
        type: 'QuestionTimerCancelled',
        data: data
      },
      {
        clientTimestamp: moment().toISOString(),
        relativeTiming: '+0',
        type: 'QuestionAnswered',
        data: data
      }
    ]
  }
}

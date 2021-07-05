import { CheckQuestion, CompleteCheckAuditEntry, AuditEntryType } from '../../schemas/check-schemas/submitted-check'
import moment from 'moment'

export class FakeCheckAuditGeneratorService {
  createAudits (questions: CheckQuestion[]): CompleteCheckAuditEntry[] {
    return [...this.buildWarmupEntries(), ...this.buildQuestionEntries(questions), ...this.buildSubmissionEntries()]
  }

  private buildSubmissionEntries (): CompleteCheckAuditEntry[] {
    return [
      {
        type: AuditEntryType.CheckSubmissionPending,
        clientTimestamp: moment().toISOString(),
        relativeTiming: '+0'
      },
      {
        type: AuditEntryType.CheckSubmissionApiCalled,
        clientTimestamp: moment().toISOString(),
        relativeTiming: '+0'
      }
    ]
  }

  private buildQuestionEntries (questions: CheckQuestion[]): CompleteCheckAuditEntry[] {
    const questionAudit = new Array<CompleteCheckAuditEntry>()
    const typeEntries = [AuditEntryType.PauseRendered, AuditEntryType.QuestionRendered,
      AuditEntryType.QuestionTimerStarted, AuditEntryType.QuestionAnswered, AuditEntryType.QuestionTimerCancelled]
    for (let index = 0; index < questions.length; index++) {
      const question = questions[index]
      const data = {
        sequenceNumber: question.order,
        question: `${question.factor1}x${question.factor2}`,
        isWarmup: false
      }
      const questionEntries = typeEntries.map(t => {
        return {
          clientTimestamp: moment().toISOString(),
          relativeTiming: '+0',
          type: t,
          data: data
        }
      })
      questionAudit.push(...questionEntries)
    }
    return questionAudit
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
      type: AuditEntryType.WarmupStarted,
      clientTimestamp: moment().add(1, 'seconds').toISOString(),
      relativeTiming: '+0'
    },
    {
      type: AuditEntryType.WarmupIntroRendered,
      clientTimestamp: moment().add(2, 'seconds').toISOString(),
      relativeTiming: '+0'
    }]
    const warmupAnswers = new Array<CompleteCheckAuditEntry>()
    for (let index = 0; index < this.warmupQuestions.length; index++) {
      const q = this.warmupQuestions[index]
      warmupAnswers.push(...this.buildWarmupQuestionEntries(q))
    }
    const footer: CompleteCheckAuditEntry = {
      type: AuditEntryType.WarmupCompleteRendered,
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
        type: AuditEntryType.PauseRendered,
        data: data
      },
      {
        clientTimestamp: moment().toISOString(),
        relativeTiming: '+0',
        type: AuditEntryType.QuestionTimerStarted,
        data: data
      },
      {
        clientTimestamp: moment().toISOString(),
        relativeTiming: '+0',
        type: AuditEntryType.QuestionRendered,
        data: data
      },
      {
        clientTimestamp: moment().toISOString(),
        relativeTiming: '+0',
        type: AuditEntryType.QuestionTimerCancelled,
        data: data
      },
      {
        clientTimestamp: moment().toISOString(),
        relativeTiming: '+0',
        type: AuditEntryType.QuestionAnswered,
        data: data
      }
    ]
  }
}

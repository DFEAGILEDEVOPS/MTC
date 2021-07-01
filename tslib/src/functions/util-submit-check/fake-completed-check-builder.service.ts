import { PreparedCheck } from '../../schemas/check-schemas/prepared-check'
import { CheckQuestion, CompleteCheckAnswer, CompleteCheckAuditEntry, CompleteCheckInputEntry, SubmittedCheck } from '../../schemas/check-schemas/submitted-check'
import * as faker from 'faker'
import moment from 'moment'
import { CompletedCheckAuditBuilderService } from './completed-check-audit-builder.service'

export interface ISubmittedCheckBuilderService {
  create (preparedCheck: PreparedCheck): SubmittedCheck
}

export class FakeCompletedCheckBuilderService implements ISubmittedCheckBuilderService {
  private readonly completedCheckAuditBuilderService: CompletedCheckAuditBuilderService

  constructor () {
    this.completedCheckAuditBuilderService = new CompletedCheckAuditBuilderService()
  }

  private readonly languages = ['en-GB', 'en-US']
  private readonly platforms = ['win32', 'macOS']
  private readonly userAgents = ['x', 'y']
  private readonly orientations = ['landscape', 'portrait']

  private readonly randomScreenValue = (): number => {
    return faker.datatype.number({
      min: 800,
      max: 1600
    })
  }

  private createAnswers (questions: CheckQuestion[]): CompleteCheckAnswer[] {
    const answers = questions.map(q => {
      return {
        answer: q.factor1 * q.factor2,
        clientTimestamp: moment().add(q.order, 'seconds').toISOString(),
        factor1: q.factor1,
        factor2: q.factor2,
        question: `${q.factor1}x${q.factor2}`,
        sequenceNumber: q.order
      }
    })
    return answers
  }

  private createAudits (questions: CheckQuestion[]): CompleteCheckAuditEntry[] {
    const warmupEntries = this.completedCheckAuditBuilderService.createAudits(questions)
    // TODO actual questions
    const questionEntries = new Array<CompleteCheckAuditEntry>()
    // TODO add check submission entries
    const checkSubmissionEntries = new Array<CompleteCheckAuditEntry>()
    return [...warmupEntries, ...questionEntries, ...checkSubmissionEntries]
  }

  private createInputs (questions: CheckQuestion[]): CompleteCheckInputEntry[] {
    // TODO create inputs service
    return [
      {
        clientTimestamp: '2019-08-28T15:40:00.608Z',
        eventType: 'keydown',
        input: '3',
        question: '1x1',
        sequenceNumber: 1,
        relativeTiming: 'x'
      }
    ]
    // return new Array<CompleteCheckInputEntry>()
  }

  create (preparedCheck: PreparedCheck): SubmittedCheck {
    const answers = this.createAnswers(preparedCheck.questions)
    const audits = this.createAudits(preparedCheck.questions)
    const inputs = this.createInputs(preparedCheck.questions)

    return {
      answers: answers,
      audit: audits,
      checkCode: preparedCheck.checkCode,
      config: preparedCheck.config,
      device: {
        appUsageCounter: 1,
        battery: {
          chargingTime: 0,
          dischargingTime: 0,
          isCharging: faker.datatype.boolean(),
          levelPercent: faker.datatype.number({ min: 1, max: 100 })
        },
        cpu: {
          hardwareConcurrency: faker.datatype.number({ min: 1, max: 10 })
        },
        deviceId: faker.datatype.uuid(),
        navigator: {
          cookieEnabled: faker.datatype.boolean(),
          doNotTrack: faker.datatype.boolean(),
          language: faker.random.arrayElement(this.languages),
          platform: faker.random.arrayElement(this.platforms),
          userAgent: faker.random.arrayElement(this.userAgents)
        },
        networkConnection: {
          downlink: 1,
          effectiveType: '',
          rtt: 1
        },
        screen: {
          colorDepth: 24,
          innerHeight: this.randomScreenValue(),
          innerWidth: this.randomScreenValue(),
          orientation: faker.random.arrayElement(this.orientations),
          outerHeight: this.randomScreenValue(),
          outerWidth: this.randomScreenValue(),
          screenHeight: this.randomScreenValue(),
          screenWidth: this.randomScreenValue()
        }
      },
      inputs: inputs,
      pupil: {
        checkCode: preparedCheck.checkCode,
        inputAssistant: {
          firstName: '',
          lastName: ''
        }
      },
      questions: preparedCheck.questions,
      school: {
        name: faker.company.companyName(),
        uuid: preparedCheck.school.uuid
      },
      schoolUUID: preparedCheck.school.uuid,
      tokens: preparedCheck.tokens
    }
  }
}

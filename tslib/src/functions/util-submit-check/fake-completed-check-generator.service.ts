import { PreparedCheck } from '../../schemas/check-schemas/prepared-check'
import { CheckQuestion, CompleteCheckAnswer, SubmittedCheck } from '../../schemas/check-schemas/submitted-check'
import * as faker from 'faker'
import moment from 'moment'
import { FakeCheckAuditGeneratorService } from './fake-check-audit-generator.service'
import { FakeCheckInputsGeneratorService } from './fake-check-inputs-generator.service'

export interface ICompletedCheckGeneratorService {
  create (preparedCheck: PreparedCheck): SubmittedCheck
}

export class FakeCompletedCheckGeneratorService implements ICompletedCheckGeneratorService {
  private readonly fakeCheckAuditBuilderService: FakeCheckAuditGeneratorService
  private readonly fakeCheckInputsGeneratorService: FakeCheckInputsGeneratorService

  constructor () {
    this.fakeCheckAuditBuilderService = new FakeCheckAuditGeneratorService()
    this.fakeCheckInputsGeneratorService = new FakeCheckInputsGeneratorService()
  }

  private readonly languages = ['en-GB', 'en-US', 'en', 'en-ie']
  private readonly platforms = ['win32', 'MacIntel', 'Win64', 'LINUX X86_64']
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.3',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
    'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1'
  ]
  private readonly orientations = ['landscape-primary', 'landscape-secondary', 'portrait-primary', 'portrait-secondary']
  private readonly connectionTypes = [ 'slow-2g', '2g', '3g', '4g' ]

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
    const numberOfPotentiallyWrongAnswers = faker.datatype.number({ min: 0, max: questions.length })
    for (let index = 0; index < numberOfPotentiallyWrongAnswers; index++) {
      const answer = faker.random.arrayElement(answers)
      // just pick any number in the given range, it could be correct or not...
      const newAnswer = faker.datatype.number({ min: 0, max: 144 })
      answer.answer = newAnswer
    }
    return answers
  }

  create (preparedCheck: PreparedCheck): SubmittedCheck {
    const answers = this.createAnswers(preparedCheck.questions)
    const audits = this.fakeCheckAuditBuilderService.createAudits(preparedCheck.questions)
    const inputs = this.fakeCheckInputsGeneratorService.create(answers)

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
          effectiveType: faker.random.arrayElement(this.connectionTypes),
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

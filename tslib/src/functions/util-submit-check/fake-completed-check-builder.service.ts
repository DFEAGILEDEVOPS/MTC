import { PreparedCheck } from '../../schemas/check-schemas/prepared-check'
import { SubmittedCheck } from '../../schemas/check-schemas/submitted-check'
import * as faker from 'faker'

export interface ISubmittedCheckBuilderService {
  create (preparedCheck: PreparedCheck): SubmittedCheck
}

export class FakeCompletedCheckBuilderService implements ISubmittedCheckBuilderService {
  private readonly randomScreenValue = (): number => {
    return faker.datatype.number({
      min: 800,
      max: 1600
    })
  }

  private readonly languages = ['en-GB', 'en-US']
  private readonly platforms = ['win32', 'macOS']
  private readonly userAgents = ['x', 'y']
  private readonly orientations = ['landscape', 'portrait']

  create (preparedCheck: PreparedCheck): SubmittedCheck {
    return {
      answers: [{
        answer: 1,
        clientTimestamp: '',
        factor1: 1,
        factor2: 1,
        question: '1x1',
        sequenceNumber: 1
      }],
      audit: [],
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
      inputs: [],
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

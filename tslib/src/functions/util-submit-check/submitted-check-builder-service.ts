import { PreparedCheck } from '../../schemas/check-schemas/prepared-check'
import { SubmittedCheck } from '../../schemas/check-schemas/submitted-check'

export interface ISubmittedCheckBuilderService {
  create (preparedCheck: PreparedCheck): SubmittedCheck
}

export class SubmittedCheckBuilderService {
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
          isCharging: false,
          levelPercent: 100
        },
        cpu: {
          hardwareConcurrency: 2
        },
        deviceId: 'abc',
        navigator: {
          cookieEnabled: false,
          doNotTrack: true,
          language: 'en-GB',
          platform: 'x',
          userAgent: 'y'
        },
        networkConnection: {
          downlink: 1,
          effectiveType: '',
          rtt: 1
        },
        screen: {
          colorDepth: 24,
          innerHeight: 1,
          innerWidth: 2,
          orientation: 'landscape',
          outerHeight: 3,
          outerWidth: 4,
          screenHeight: 5,
          screenWidth: 6
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
        name: 'a',
        uuid: 'x'
      },
      schoolUUID: preparedCheck.school.uuid,
      tokens: preparedCheck.tokens
    }
  }
}

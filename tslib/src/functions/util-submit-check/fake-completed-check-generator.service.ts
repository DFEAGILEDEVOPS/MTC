import { PreparedCheck } from '../../schemas/check-schemas/prepared-check'
import { CheckQuestion, CompleteCheckAnswer, CompleteCheckAuditEntry, CompleteCheckInputEntry, ValidCheck, InputEventType, AuditEntryType } from '../../schemas/check-schemas/validated-check'
import { faker } from '@faker-js/faker'
import moment from 'moment'
// import { FakeCheckAuditGeneratorService } from './fake-check-audit-generator.service'
// import { FakeCheckInputsGeneratorService } from './fake-check-inputs-generator.service'
import { IUtilSubmitCheckConfig } from '.'
import { Answer } from '../check-marker/models'

export interface ICompletedCheckGeneratorService {
  create (preparedCheck: PreparedCheck, funcConfig?: IUtilSubmitCheckConfig): ValidCheck
}

export class FakeCompletedCheckGeneratorService implements ICompletedCheckGeneratorService {
  // private readonly fakeCheckAuditBuilderService: FakeCheckAuditGeneratorService
  // private readonly fakeCheckInputsGeneratorService: FakeCheckInputsGeneratorService

  // constructor () {
  //   // this.fakeCheckAuditBuilderService = new FakeCheckAuditGeneratorService()
  //   // this.fakeCheckInputsGeneratorService = new FakeCheckInputsGeneratorService()
  // }

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
  private readonly connectionTypes = ['slow-2g', '2g', '3g', '4g']

  private readonly randomScreenValue = (): number => {
    return faker.datatype.number({
      min: 800,
      max: 1600
    })
  }

  // /**
  //  *
  //  * @param {CheckQuestion} question Create a single answer.
  //  * @param {boolean} isCorrect
  //  * @param {moment.Moment} baseTime represents the time the timer was started
  //  * @returns CompleteCheckAnswer
  //  */
  // private createAnswer(question: CheckQuestion, isCorrect: boolean, baseTime: moment.Moment): CompleteCheckAnswer {
  //   const correctAnswer = question.factor1 * question.factor2
  //   const answer: CompleteCheckAnswer = {
  //       answer: `${correctAnswer}`,
  //       clientTimestamp: moment().add(question.order, 'seconds').toISOString(),
  //       factor1: q.factor1,
  //       factor2: q.factor2,
  //       question: `${q.factor1}x${q.factor2}`,
  //       sequenceNumber: q.order
  //     })
  //   return answer
  // }

  // protected createAnswersOLD (questions: CheckQuestion[], numberFromCorrectCheckForm: number = questions.length, numberFromIncorrectCheckForm: number = 0, numberOfDuplicateAnswers: number = 0): CompleteCheckAnswer[] {
  //   const answers: Answer[] = []
  //   for (let i = 0; i < numberFromCorrectCheckForm; i++) {
  //     const q = questions[i]
  //     const correctAnswer = q.factor1 * q.factor2
  //     answers.push({
  //       answer: `${correctAnswer}`,
  //       clientTimestamp: moment().add(q.order, 'seconds').toISOString(),
  //       factor1: q.factor1,
  //       factor2: q.factor2,
  //       question: `${q.factor1}x${q.factor2}`,
  //       sequenceNumber: q.order
  //     })
  //   }

  //   const numberOfPotentiallyWrongAnswers = faker.datatype.number({ min: 0, max: answers.length })
  //   for (let index = 0; index < numberOfPotentiallyWrongAnswers; index++) {
  //     const answer = faker.random.arrayElement(answers)
  //     // just pick any number in the given range, it could be correct or not...
  //     const newAnswer = faker.datatype.number({ min: 0, max: 144 })
  //     answer.answer = `${newAnswer}`
  //   }

  //   // Optionally add some new answers from wrong forms mimining data corruption in local storage
  //   for (let i = 0; i < numberFromIncorrectCheckForm; i++) {
  //     const index = answers.length + i
  //     answers.push({
  //       answer: '1',
  //       clientTimestamp: moment().add(index, 'seconds').toISOString(),
  //       factor1: 0,
  //       factor2: index,
  //       question: `0x${index}`,
  //       sequenceNumber: index
  //     })
  //   }

  //   if (numberOfDuplicateAnswers > 0) {
  //     // start the duplications at the first question
  //     for (let i = 0; i < numberOfDuplicateAnswers; i++) {
  //       const sequenceNumber = i + 1
  //       answers.push({
  //         answer: '216',
  //         clientTimestamp: moment().add(i, 'seconds').toISOString(),
  //         factor1: 0,
  //         factor2: i,
  //         question: `0x${i}`,
  //         sequenceNumber: sequenceNumber
  //       })
  //     }
  //   }

  //   return answers
  // }

  private createAuditEvent (auditType: AuditEntryType, dt: moment.Moment, question?: CheckQuestion, isWarmup?: boolean): CompleteCheckAuditEntry {
    const data: any = {}
    if (question !== undefined) {
      data.question =`${question.factor1}x${question.factor2}`
      data.sequenceNumber = question.order
      if (isWarmup !== undefined) {
        data.isWarmup = isWarmup
      } else {
        data.isWarmup = false
      }
    }

    return {
      type: auditType,
      clientTimestamp: dt.toISOString(),
      data
    }
  }

  private createMockResponse (questionNumber: number, question: CheckQuestion, baseTime: moment.Moment, wantRandomAnswer: boolean = false): { answer: CompleteCheckAnswer, inputs: CompleteCheckInputEntry[], audits: CompleteCheckAuditEntry[] } {
    // the answer as a string
    const input: string = wantRandomAnswer ? faker.datatype.number({ min: 1, max: 150 }).toString() : (question.factor1 * question.factor2).toString()
    const audits: CompleteCheckAuditEntry[] = []

    // Add 3 seconds to mimic the load screen
    audits.push(this.createAuditEvent(AuditEntryType.PauseRendered, baseTime, question, false))
    baseTime.add(3, 'seconds')
    // Show the question
    audits.push(this.createAuditEvent(AuditEntryType.QuestionRendered, baseTime, question, false))
    audits.push(this.createAuditEvent(AuditEntryType.QuestionTimerStarted, baseTime, question, false))

    // Capture the inputs and the question
    const inputs = [...input].map(num => {
      const thinkingDelayMs = faker.datatype.number({ min: 150, max: 1800 })
      baseTime.add(thinkingDelayMs, 'milliseconds')

      return {
        input: num,
        clientTimestamp: baseTime.toISOString(),
        eventType: InputEventType.Keyboard,
        question: `${question.factor1}x${question.factor2}`,
        sequenceNumber: questionNumber
      }
    })

    // And add an Enter button keypress to the tail of the inputs
    const thinkingDelayMs = faker.datatype.number({ min: 500, max: 1800 })
    baseTime.add(thinkingDelayMs, 'milliseconds')
    inputs.push({
      input: 'Enter',
      clientTimestamp: baseTime.toISOString(),
      eventType: InputEventType.Keyboard,
      question: `${question.factor1}x${question.factor2}`,
      sequenceNumber: questionNumber
    })

    // Capture the Timer cancelled and Answer events
    audits.push(this.createAuditEvent(AuditEntryType.QuestionTimerCancelled, baseTime, question, false))
    audits.push(this.createAuditEvent(AuditEntryType.QuestionAnswered, baseTime, question, false))

    // construct the answer object to be included in the payload
    const answer: Answer = {
      answer: input,
      clientTimestamp: baseTime.toISOString(), // the answer timestamp is the same as the last input ('Enter' key)
      factor1: question.factor1,
      factor2: question.factor2,
      question: `${question.factor1}x${question.factor2}`,
      sequenceNumber: questionNumber
    }

    return { answer, inputs, audits }
  }

  /**
     * For a single check create a complete set of answers, inputs and audits (events) that are consistent with each other so that the event timings are valid and correct looking.
     * @param num
     * @returns
     */
  createResponses (questions: CheckQuestion[], numberFromCorrectCheckForm: number = questions.length, numberFromIncorrectCheckForm: number = 0, numberOfDuplicateAnswers: number = 0): { answers: CompleteCheckAnswer[], inputs: CompleteCheckInputEntry[], audits: CompleteCheckAuditEntry[] } {
    const responses: { answers: CompleteCheckAnswer[], inputs: CompleteCheckInputEntry[], audits: CompleteCheckAuditEntry[] } = { answers: [], inputs: [], audits: [] }

    // The check starts now.  We will pass `dt` around by reference and keep adding more time to it, to
    // make the timings look authentic.
    const dt = moment()
    responses.audits.push(this.createAuditEvent(AuditEntryType.CheckStarted, dt))

    for (let i = 0; i < questions.length; i++) {
      const resp = this.createMockResponse(i + 1, questions[i], dt, true)
      responses.answers.push(resp.answer)
      responses.inputs.push(...resp.inputs)
      responses.audits.push(...resp.audits)
    }

    console.log('number iof duplicates is ', numberOfDuplicateAnswers)
    if (numberOfDuplicateAnswers > 0 ) {
      if (numberOfDuplicateAnswers > 25) { // You might want more duplicates.  This seems enough though.
        throw new Error('Error: too many duplicates requested')
      }
      for (let i = 0; i < numberOfDuplicateAnswers; i++) {
        const qidx = i + 1 <= questions.length? i : questions.length - 1
        const resp = this.createMockResponse(qidx + 1, questions[qidx], dt, true)
        responses.answers.push(resp.answer)
        responses.inputs.push(...resp.inputs)
        responses.audits.push(...resp.audits)
      }
    }

    // Add some final audits
    dt.add(1, 'millisecond')
    responses.audits.push(this.createAuditEvent(AuditEntryType.CheckSubmissionPending, dt))
    dt.add(1, 'millisecond')
    responses.audits.push(this.createAuditEvent(AuditEntryType.CheckSubmissionApiCalled, dt))

    return responses
  }

  create (preparedCheck: PreparedCheck, funcConfig?: IUtilSubmitCheckConfig): ValidCheck {
    const response = this.createResponses(preparedCheck.questions,
      funcConfig?.answers?.numberFromCorrectCheckForm,
      funcConfig?.answers?.numberFromIncorrectCheckForm,
      funcConfig?.answers?.numberOfDuplicateAnswers)



    return {
      answers: response.answers,
      audit: response.audits,
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
          language: faker.helpers.arrayElement(this.languages),
          platform: faker.helpers.arrayElement(this.platforms),
          userAgent: faker.helpers.arrayElement(this.userAgents)
        },
        networkConnection: {
          downlink: 1,
          effectiveType: faker.helpers.arrayElement(this.connectionTypes),
          rtt: 1
        },
        screen: {
          colorDepth: 24,
          innerHeight: this.randomScreenValue(),
          innerWidth: this.randomScreenValue(),
          orientation: faker.helpers.arrayElement(this.orientations),
          outerHeight: this.randomScreenValue(),
          outerWidth: this.randomScreenValue(),
          screenHeight: this.randomScreenValue(),
          screenWidth: this.randomScreenValue()
        }
      },
      inputs: response.inputs,
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

import moment from 'moment'
import {
  AnswersOrNull,
  CheckConfigOrNull,
  CheckFormOrNull,
  CheckOrNull, DeviceOrNull, EventsOrNull,
  Event,
  Pupil,
  School, Answer
} from '../../functions-throttled/ps-report-2-pupil-data/models'
import { IPsychometricReportLine } from './models'
import { deepFreeze } from '../../common/deep-freeze'
import { ReportLineAnswer } from './report-line-answer.class'

export class ReportLine {
  private readonly _answers: AnswersOrNull
  private readonly _check: CheckOrNull
  private readonly _checkConfig: CheckConfigOrNull
  private readonly _checkForm: CheckFormOrNull
  private readonly _device: DeviceOrNull
  private readonly _events: EventsOrNull
  private readonly _pupil: Pupil
  private readonly _school: School
  private _report: IPsychometricReportLine = {
    // Pupil fields
    DOB: null,
    Gender: '',
    PupilID: '',
    Forename: '',
    Surname: '',
    ReasonNotTakingCheck: null,

    // School fields
    SchoolName: '',
    Estab: null,
    SchoolURN: null,
    LAnum: null,

    // Check Settings
    QDisplayTime: null,
    PauseLength: null,
    AccessArr: '',

    // Check details
    AttemptID: '',
    FormID: '',
    TestDate: null,
    TimeStart: null,
    TimeComplete: null,
    TimeTaken: null,
    RestartNumber: null,
    FormMark: null,

    // Device
    DeviceType: null,
    BrowserType: null,
    DeviceTypeModel: null,
    DeviceID: null,

    // Question and answer data
    answers: []
  }

  constructor (
    answers: AnswersOrNull,
    check: CheckOrNull,
    checkConfig: CheckConfigOrNull,
    checkForm: CheckFormOrNull,
    device: DeviceOrNull,
    events: EventsOrNull,
    pupil: Pupil,
    school: School
  ) {
    this._answers = deepFreeze(answers)
    this._check = deepFreeze(check)
    this._checkConfig = deepFreeze(checkConfig)
    this._checkForm = deepFreeze(checkForm)
    this._device = deepFreeze(device)
    this._events = deepFreeze(events)
    this._pupil = deepFreeze(pupil)
    this._school = deepFreeze(school)
  }

  get answers (): AnswersOrNull {
    return this._answers
  }

  get check (): CheckOrNull {
    return this._check
  }

  get checkConfig (): CheckConfigOrNull {
    return this._checkConfig
  }

  get checkForm (): CheckFormOrNull {
    return this._checkForm
  }

  get device (): DeviceOrNull {
    return this._device
  }

  get events (): EventsOrNull {
    return this._events
  }

  get pupil (): Pupil {
    return this._pupil
  }

  get school (): School {
    return this._school
  }

  private getAccessArrangements (): string {
    if (this.checkConfig === null) {
      return ''
    }

    const map = {
      audibleSounds: 1,
      questionReader: 2,
      colourContrast: 3,
      inputAssistance: 4,
      fontSize: 5,
      nextBetweenQuestions: 6,
      numpadRemoval: 7
    }

    const arrangements: String[] = []
    Object.keys(map).forEach(k => {
      // @ts-ignore - ignore, `map` is badly typed
      if (this.checkConfig[k] === true) {
        // @ts-ignore - ignore, we know that the key is `true`, see `map`
        const s = `[${map[k]}]`
        arrangements.push(s)
      }
    })
    return arrangements.join('')
  }

  private findEvent (eventType: string, questionNumber: number | null = null): Event | null {
    if (this.events === null) {
      return null
    }
    if (!Array.isArray(this.events)) {
      return null
    }
    let event: Event | undefined
    if (questionNumber === null) {
      event = this.events.find(e => e.type === eventType)
    } else {
      event = this.events.find(e => e.type === eventType && e.questionNumber === questionNumber)
    }
    if (event === undefined) {
      return null
    }
    return event
  }

  private getAnswer (questionNumber: number): Answer | null {
    if (!Array.isArray(this.answers)) {
      return null
    }
    const answer = this.answers.find(a => a.questionNumber === questionNumber)
    return answer ?? null // return null instead of undefined if not found
  }

  private getTimeStart (): moment.Moment | null {
    const event = this.findEvent('CheckStarted')
    if (event === null) {
      return null
    }
    return event.browserTimestamp
  }

  private getTimeComplete (): moment.Moment | null {
    if (!Array.isArray(this.answers)) {
      return null
    }
    const lastQuestionNumber = this.checkForm?.items.length
    if (lastQuestionNumber === undefined) {
      return null
    }
    const lastAnswer = this.getAnswer(lastQuestionNumber)
    if (lastAnswer === null) {
      return null
    }
    return lastAnswer.browserTimestamp
  }

  private getTimeTaken (): number | null {
    const timeComplete = this._report.TimeComplete
    const timeStart = this._report.TimeStart
    if (timeComplete === null || timeStart === null) {
      return null
    }
    return (timeComplete.valueOf() - timeStart.valueOf()) / 1000
  }

  private getBrowserVersion (): string | null {
    return [
      this.device?.browserMajorVersion,
      this.device?.browserMinorVersion,
      this.device?.browserPatchVersion
    ].filter(e => typeof e === 'number').join('.')
  }

  private getBrowser (): string | null {
    if (this.device === null) {
      return null
    }
    return `${this.device.browserFamily} ${this.getBrowserVersion()}`
  }

  private getTimeout (questionNumber: number): boolean {
    const event = this.findEvent('QuestionTimerEnded', questionNumber)
    if (event === null) {
      return false
    }
    return true
  }

  private getTimeoutResponse (answer: Answer): boolean | string {
    const timeout = this.getTimeout(answer.questionNumber)
    if (timeout) {
      if (answer.response.length > 0) {
        return true // timeout with an answer
      } else {
        return false // timeout without an answer
      }
    }
    return '' // no timeout
  }

  private _transform (): void {
    this._report.DOB = this.pupil.dateOfBirth
    this._report.Gender = this.pupil.gender.toUpperCase()
    this._report.PupilID = this.pupil.upn
    this._report.Forename = this.pupil.forename
    this._report.Surname = this.pupil.lastname
    this._report.ReasonNotTakingCheck = this.pupil.attendanceId
    this._report.SchoolName = this.school.name
    this._report.Estab = this.school.estabCode
    this._report.SchoolURN = this.school.urn
    this._report.LAnum = this.school.laCode
    this._report.QDisplayTime = this.checkConfig?.questionTime ?? null // set to null rather than undefined
    this._report.PauseLength = this.checkConfig?.loadingTime ?? null // set to null rather than undefined
    this._report.AccessArr = this.getAccessArrangements()
    this._report.AttemptID = this.check?.checkCode ?? '' // set to empty string if null or undefined
    this._report.FormID = this.checkForm?.name ?? '' // set to empty string if null or undefined
    this._report.TestDate = this.check?.pupilLoginDate ?? null // set to null if there is no check
    this._report.TimeStart = this.getTimeStart()
    this._report.TimeComplete = this.getTimeComplete()
    this._report.TimeTaken = this.getTimeTaken()
    this._report.RestartNumber = this.check?.restartNumber ?? null // set to null if there is no check
    this._report.FormMark = this.check?.mark ?? null
    this._report.DeviceType = this.device?.type ?? null
    this._report.BrowserType = this.getBrowser()
    this._report.DeviceTypeModel = this.device?.typeModel ?? null
    this._report.DeviceID = this.device?.deviceId ?? null

    // Question data
    this.answers?.forEach(answer => {
      const rla = new ReportLineAnswer()
      rla.questionNumber = answer.questionNumber
      rla.id = answer.question
      rla.response = answer.response

      if (answer.inputs !== null) {
        rla.addInputs(answer.inputs)
      }

      rla.score = answer.isCorrect ? 1 : 0
      rla.timeout = this.getTimeout(answer.questionNumber)
      rla.timeoutResponse = this.getTimeoutResponse(answer)

      // add to the report
      this._report.answers.push(rla)
    })
  }

  public transform (): IPsychometricReportLine {
    this._transform()
    return this._report
  }
}

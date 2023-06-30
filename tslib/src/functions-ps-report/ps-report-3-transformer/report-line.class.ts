import moment from 'moment'
import {
  AnswersOrNull,
  CheckConfigOrNull,
  CheckFormOrNull,
  CheckOrNull, DeviceOrNull, EventsOrNull,
  Event,
  Pupil,
  School, Answer, NotTakingCheckCode, RestartReasonCode
} from '../../functions-ps-report/ps-report-2-pupil-data/models'
import { deepFreeze } from '../../common/deep-freeze'
import { ReportLineAnswer } from './report-line-answer.class'
import { DfEAbsenceCode, IPsychometricReportLine, WorkingReportLine } from './models'

export class ReportLine {
  private readonly _answers: AnswersOrNull
  private readonly _check: CheckOrNull
  private readonly _checkConfig: CheckConfigOrNull
  private readonly _checkForm: CheckFormOrNull
  private readonly _device: DeviceOrNull
  private readonly _events: EventsOrNull
  private readonly _pupil: Pupil
  private readonly _school: School
  private _report: WorkingReportLine = {
    // Pupil fields
    PupilDatabaseId: -1,
    DOB: null,
    Gender: '',
    PupilUPN: '',
    Forename: '',
    Surname: '',
    ReasonNotTakingCheck: null,
    PupilStatus: null,
    ImportedFromCensus: false,

    // School fields
    SchoolName: '',
    Estab: null,
    SchoolURN: null,
    LAnum: null,
    ToECode: null,

    // Check Settings
    QDisplayTime: null,
    PauseLength: null,
    AccessArr: null,

    // Check details
    AttemptID: null,
    FormID: null,
    TestDate: null,
    TimeStart: null,
    TimeComplete: null,
    TimeTaken: null,
    RestartNumber: null,
    RestartReason: null,
    FormMark: null,

    // Device
    BrowserType: null,
    DeviceID: null,

    // Question and answer data
    answers: []
  }

  private readonly eventTypeTimerStarted = 'QuestionTimerStarted'
  private readonly eventTypeQuestionReaderStart = 'QuestionReaderStart'
  private readonly eventTypeQuestionReaderEnd = 'QuestionReaderEnd'

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

  protected static getReasonNotTakingCheck (code: NotTakingCheckCode | null): DfEAbsenceCode | null {
    switch (code) {
      case 'INCRG':
        return 'Z'
      case 'ABSNT':
        return 'A'
      case 'LEFTT':
        return 'L'
      case 'NOACC':
        return 'U'
      case 'BLSTD':
        return 'B'
      case 'JSTAR':
        return 'J'
      case 'ANLLD':
        return 'Q'
    }
    return null
  }

  protected static getRestartReason (code: RestartReasonCode | null): number | null {
    switch (code) {
      case 'LOI':
        return 1
      case 'ITI':
        return 2
      case 'CLD':
        return 3
      case 'DNC':
        return 4
    }

    return null
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
    const browserVersion = this.getBrowserVersion()
    const output = [this.device?.browserFamily, browserVersion]
      .filter(x => typeof x === 'string' && x.length > 0)
      .join(' ')
    return output.length > 0 ? output : null
  }

  private getTimeout (questionNumber: number): boolean {
    const event = this.findEvent('QuestionTimerEnded', questionNumber)
    return event !== null
  }

  private getTimeoutResponse (answer: Answer): boolean | null {
    const timeout = this.getTimeout(answer.questionNumber)
    if (timeout) {
      return answer.response.length > 0
    }
    return null // no timeout
  }

  private getTimeoutScore (answer: Answer): boolean | null {
    const timeout = this.getTimeout(answer.questionNumber)
    if (timeout) {
      return answer.isCorrect // timeout with a response
    }
    return null // no timeout
  }

  private getLoadTime (answer: Answer): moment.Moment | null {
    const loadEvent = this.findEvent(this.eventTypeTimerStarted, answer.questionNumber)
    if (loadEvent === null) {
      return null
    }
    return loadEvent.browserTimestamp
  }

  private getQuestionReaderStart (answer: Answer): moment.Moment | null {
    const event = this.findEvent(this.eventTypeQuestionReaderStart, answer.questionNumber)
    if (event === null) {
      return null
    }
    return event.browserTimestamp
  }

  private getQuestionReaderEnd (answer: Answer): moment.Moment | null {
    const event = this.findEvent(this.eventTypeQuestionReaderEnd, answer.questionNumber)
    if (event === null) {
      return null
    }
    return event.browserTimestamp
  }

  private getPupilStatus (): string {
    if (this._pupil.checkComplete === true) {
      return 'Complete'
    }
    if (this._pupil.notTakingCheckCode !== null) {
      return 'Not taking the Check'
    }
    return 'Incomplete'
  }

  private getFormMark (): number | null {
    if (this._pupil.notTakingCheckCode !== null) {
      // Pupils marked as not taking the check should have a null FormMark.  This is generic case
      // that also covers the specific case of annulled pupils.
      return null
    }
    return this.check?.mark ?? null
  }

  private getAttemptId (): string | null {
    if (this.check === null) {
      return null
    }
    if (this.check?.pupilLoginDate === null) {
      return null
    }
    return this.check.checkCode
  }

  private getFormId (): string | null {
    if (this.check === null) {
      return null
    }
    if (this.check?.pupilLoginDate === null) {
      return null
    }
    return this.checkForm?.name ?? null
  }

  private _transform (): void {
    // Pupil data
    this._report.PupilDatabaseId = this.pupil.id
    this._report.DOB = this.pupil.dateOfBirth
    this._report.Gender = this.pupil.gender.toUpperCase()
    this._report.PupilUPN = this.pupil.upn
    this._report.Forename = this.pupil.forename
    this._report.Surname = this.pupil.lastname
    this._report.ReasonNotTakingCheck = ReportLine.getReasonNotTakingCheck(this._pupil.notTakingCheckCode)
    this._report.SchoolName = this.school.name
    this._report.Estab = this.school.estabCode
    this._report.SchoolURN = this.school.urn
    this._report.LAnum = this.school.laCode
    this._report.AccessArr = this.getAccessArrangements()
    // Check data
    if (this._report.ReasonNotTakingCheck === null) {
      this._report.QDisplayTime = this.checkConfig?.questionTime ?? null // set to null rather than undefined
      this._report.PauseLength = this.checkConfig?.loadingTime ?? null // set to null rather than undefined
      this._report.AttemptID = this.getAttemptId()
      this._report.FormID = this.getFormId()
      this._report.TestDate = this.check?.pupilLoginDate ?? null // set to null if there is no check
      this._report.TimeStart = this.getTimeStart()
      this._report.TimeComplete = this.getTimeComplete()
      this._report.TimeTaken = this.getTimeTaken()
      this._report.RestartNumber = this.check?.restartNumber ?? null // set to null if there is no check
      this._report.RestartReason = ReportLine.getRestartReason(this.check?.restartReason ?? null) // map the code to the number
      this._report.FormMark = this.getFormMark()
      this._report.BrowserType = this.getBrowser()
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
        rla.timeoutScore = this.getTimeoutScore(answer)
        rla.loadTime = this.getLoadTime(answer)
        rla.questionReaderStart = this.getQuestionReaderStart(answer)
        rla.questionReaderEnd = this.getQuestionReaderEnd(answer)
        rla.calculateOverallTime()
        rla.calculateRecallTime()

        // add to the report
        this._report.answers.push(rla)
      })
    }
    // other data
    this._report.PupilStatus = this.getPupilStatus()
    this._report.ImportedFromCensus = this.pupil.jobId !== null
    this._report.ToECode = this.school.typeOfEstablishmentCode
  }

  public toObject (): IPsychometricReportLine {
    return {
      PupilDatabaseId: this._report.PupilDatabaseId,
      DOB: this._report.DOB,
      Gender: this._report.Gender,
      PupilUPN: this._report.PupilUPN,
      Forename: this._report.Forename,
      Surname: this._report.Surname,
      ReasonNotTakingCheck: this._report.ReasonNotTakingCheck,
      PupilStatus: this._report.PupilStatus,
      SchoolName: this._report.SchoolName,
      Estab: this._report.Estab,
      SchoolURN: this._report.SchoolURN,
      LAnum: this._report.LAnum,
      QDisplayTime: this._report.QDisplayTime,
      PauseLength: this._report.PauseLength,
      AccessArr: this._report.AccessArr,
      AttemptID: this._report.AttemptID,
      FormID: this._report.FormID,
      TestDate: this._report.TestDate,
      TimeStart: this._report.TimeStart,
      TimeComplete: this._report.TimeComplete,
      TimeTaken: this._report.TimeTaken,
      RestartNumber: this._report.RestartNumber,
      RestartReason: this._report.RestartReason,
      FormMark: this._report.FormMark,
      BrowserType: this._report.BrowserType,
      DeviceID: this._report.DeviceID,
      answers: this._report.answers.map(o => o.toObject()),
      ImportedFromCensus: this._report.ImportedFromCensus,
      ToECode: this._report.ToECode
    }
  }

  public transform (): IPsychometricReportLine {
    this._transform()
    return this.toObject()
  }
}

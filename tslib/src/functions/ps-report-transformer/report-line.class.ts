import {
  AnswersOrNull,
  CheckConfigOrNull,
  CheckFormOrNull,
  CheckOrNull, DeviceOrNull, EventsOrNull,
  Pupil,
  School
} from '../../functions-throttled/ps-report-2-pupil-data/models'
import { PsychometricReportLine } from './models'

export class ReportLine {
  private readonly _answers: AnswersOrNull
  private readonly _check: CheckOrNull
  private readonly _checkConfig: CheckConfigOrNull
  private readonly _checkForm: CheckFormOrNull
  private readonly _device: DeviceOrNull
  private readonly _events: EventsOrNull
  private readonly _pupil: Pupil
  private readonly _school: School
  private _report: PsychometricReportLine = {
    // Pupil fields
    DOB: '',
    Gender: '',
    PupilID: '',
    Forename: '',
    Surname: '',
    ReasonNotTakingCheck: null
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
    this._answers = answers
    this._check = check
    this._checkConfig = checkConfig
    this._checkForm = checkForm
    this._device = device
    this._events = events
    this._pupil = pupil
    this._school = school
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

  private _transform (): void {
    this._report.DOB = this.pupil.dateOfBirth.format('DD/MM/YYYY')
    this._report.Gender = this.pupil.gender.toUpperCase()
    this._report.PupilID = this.pupil.upn
    this._report.Forename = this.pupil.forename
    this._report.Surname = this.pupil.lastname
    this._report.ReasonNotTakingCheck = this.pupil.attendanceId
  }

  public transform (): PsychometricReportLine {
    this._transform()
    return this._report
  }
}

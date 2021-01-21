import { Input } from '../../functions-throttled/ps-report-2-pupil-data/models'
import * as R from 'ramda'

export class ReportLineAnswer {
  private _questionNumber: number | null = null
  private _id: string | null = null
  private _response: string | null = null
  private _inputMethods: string | null = null
  private _keystrokes: string | null = null

  set questionNumber (num) {
    if (typeof num === 'number' && (num <= 0 || num > 25)) {
      throw new Error('questionNumber is out of range')
    }
    this._questionNumber = num
  }

  get questionNumber (): number | null {
    return this._questionNumber
  }

  get id (): string | null {
    return this._id
  }

  set id (s) {
    this._id = s
  }

  get response (): string | null {
    return this._response
  }

  set response (s) {
    this._response = s
  }

  get inputMethods (): string | null {
    return this._inputMethods
  }

  // inputMethods does not have a setter, it is set from set from addInputs()

  get keystrokes (): string | null {
    return this._keystrokes
  }

  // keystrokes does not have a setter, it is set from addInputs()

  private getUserInput (inputs: readonly Input[]): string {
    const output: string[] = []
    inputs.forEach(input => {
      const ident = input.inputType.toLowerCase()
      output.push(`${ident}[${input.input}]`)
    })
    return output.join(', ')
  }

  public addInputs (inputs: readonly Input[] | null): void {
    if (!Array.isArray(inputs)) {
      this._keystrokes = '' // blank, as there weren't any inputs
      this._inputMethods = '' // blank as there weren't any inputs
      return
    }

    const methodsUsed = R.pipe(R.pluck('inputType'), R.uniq, R.join(''))(inputs)
    if (methodsUsed.length <= 1) this._inputMethods = methodsUsed.toLowerCase() // set to 'k', 't', 'm', 'p', or ''
    if (methodsUsed.length > 1) this._inputMethods = 'x' // mixed inputs for this question

    this._keystrokes = this.getUserInput(inputs)
  }
}

export interface IPsychometricReportLine {
  // Pupil
  DOB: moment.Moment | null
  Gender: string
  PupilID: string
  Forename: string
  Surname: string
  ReasonNotTakingCheck: number | null
  // School
  SchoolName: string
  Estab: number | null
  SchoolURN: number | null
  LAnum: number | null
  // Settings
  QDisplayTime: number | null
  PauseLength: number | null
  AccessArr: string
  // Check
  AttemptID: string
  FormID: string
  TestDate: moment.Moment | null
  TimeStart: moment.Moment | null
  TimeComplete: moment.Moment | null
  TimeTaken: number | null // seconds with ms to 3 decimal places, e.g. 198.123
  RestartNumber: number | null
  FormMark: number | null

  // Device
  DeviceType: string | null
  BrowserType: string | null
  DeviceTypeModel: string | null
  DeviceID: string | null

  // Answers
  _answers: ReportLineAnswer[]
}

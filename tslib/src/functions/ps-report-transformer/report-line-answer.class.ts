import { Input } from '../../functions-throttled/ps-report-2-pupil-data/models'
import * as R from 'ramda'

export class ReportLineAnswer {
  private _questionNumber: number | null = null
  private _id: string | null = null
  private _response: string | null = null
  private _inputMethods: string | null = null
  private _keystrokes: string | null = null
  private _score: number | null = null

  set questionNumber (num) {
    if (typeof num === 'number' && (num <= 0 || num > 25)) {
      throw new Error('questionNumber is out of range')
    }
    this._questionNumber = num
  }

  get questionNumber (): number | null {
    return this._questionNumber
  }

  set id (s) {
    this._id = s
  }

  get id (): string | null {
    return this._id
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

  set score (score) {
    this._score = score
  }

  get score (): number | null {
    return this._score
  }

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

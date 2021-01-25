import { Input } from '../../functions-throttled/ps-report-2-pupil-data/models'
import * as R from 'ramda'

export class ReportLineAnswer {
  private _questionNumber: number | null = null
  private _id: string | null = null
  private _response: string | null = null
  private _inputMethods: string | null = null
  private _keystrokes: string | null = null
  private _score: number | null = null
  private _firstKey: moment.Moment | null = null
  private _lastKey: moment.Moment | null = null
  private _responseTime: number | null = null

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

  // set firstkey not needed as set from addInputs

  get firstKey (): moment.Moment | null {
    return this._firstKey
  }

  // set lastKey not needed as set from addInputs

  get lastKey (): moment.Moment | null {
    return this._lastKey
  }

  // set responseTime not needed, it is set from addInputs()

  get responseTime (): number | null {
    return this._responseTime // seconds and ms to 3 digits: e.g. 4.253 seconds
  }

  /**
   * Return a string comprising the input-type and the answer (in square brackets) for all of the inputs for a single question.
   * E.g. `k[1], m[2], m[Enter]`.  No quoting takes place, so the left-bracket would be `k[[]` and the single quote would be `k[']`
   * @param inputs
   * @private
   */
  private getUserInput (inputs: readonly Input[]): string {
    const output: string[] = []
    inputs.forEach(input => {
      const ident = input.inputType.toLowerCase()
      output.push(`${ident}[${input.input}]`)
    })
    return output.join(', ')
  }

  /**
   * Filter the set of all inputs to just those that made up the answer.
   * The all-input set includes non-numeric characters (e.g. from mis-types on keyboards) as well as Backspace, Enter, Shift and so on.
   * This function filters the all-input set to just those inputs that eventually made up the answer:--
   *  - Numeric inputs when the response length is over 5 characters are excluded (mimicking the SPA behaviour)
   *  - Non-numeric inputs are excluded
   *  - Numeric inputs that are subsequently deleted are excluded
   * @param inputs
   * @protected
   */
  protected filterInputsToThoseFormingTheAnswer (inputs: readonly Input[]): Input[] {
    const answerFormingInputs: Input[] = []
    let response = ''
    inputs.forEach(input => {
      if (input.input.match(/^[0-9]$/) !== null && response.length < 5) {
        answerFormingInputs.push(input)
        response += input.input
        return
      }
      if (input.input.toUpperCase() === 'BACKSPACE' && response.length > 0) {
        response = response.slice(0, -1)
        answerFormingInputs.pop()
      }
    })
    return answerFormingInputs
  }

  /**
   * Add the inputs for a single question. This causes various calculations on the inputs to be performed.
   * @param inputs
   */
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
    const firstInput = R.head(inputs)
    if (firstInput !== undefined) {
      this._firstKey = firstInput.browserTimestamp
    }
    const lastInputFormingAnswer = R.last(this.filterInputsToThoseFormingTheAnswer(inputs))
    if (lastInputFormingAnswer !== undefined) {
      this._lastKey = lastInputFormingAnswer.browserTimestamp
    }
    if (this.firstKey !== null && this.lastKey !== null) {
      this._responseTime = (this.lastKey.valueOf() - this.firstKey.valueOf()) / 1000
    }
  }
}

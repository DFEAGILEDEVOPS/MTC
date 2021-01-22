import { Input } from '../../functions-throttled/ps-report-2-pupil-data/models'
import moment from 'moment/moment'
import { ReportLineAnswer } from './report-line-answer.class'

describe('PsychometricReportLineAnswer', () => {
  let sut: ReportLineAnswer
  const anyTs = moment()

  beforeEach(() => {
    sut = new ReportLineAnswer()
  })

  test('questionNumber cannot be set to a value less than 1', () => {
    const fn = (): void => { sut.questionNumber = 0 }
    expect(fn).toThrow('questionNumber is out of range')
  })

  test('questionNumber cannot be set to a value greater than 25', () => {
    const fn = (): void => { sut.questionNumber = 26 }
    expect(fn).toThrow('questionNumber is out of range')
  })

  test('adding the inputs sets the inputMethods and keystrokes - keyboard only', () => {
    const inputs: Input[] = [
      {
        answerId: 0,
        inputType: 'K',
        input: '1',
        browserTimestamp: anyTs
      },
      {
        answerId: 0,
        inputType: 'K',
        input: 'Enter',
        browserTimestamp: anyTs
      }
    ]
    sut.addInputs(inputs)
    expect(sut.inputMethods).toBe('k')
    expect(sut.keystrokes).toBe('k[1], k[Enter]')
  })

  test('adding the inputs sets the inputMethods and keystrokes - mouse only', () => {
    const inputs: Input[] = [
      {
        answerId: 0,
        inputType: 'M',
        input: '1',
        browserTimestamp: anyTs
      },
      {
        answerId: 0,
        inputType: 'M',
        input: '2',
        browserTimestamp: anyTs
      }
    ]
    sut.addInputs(inputs)
    expect(sut.inputMethods).toBe('m')
    expect(sut.keystrokes).toBe('m[1], m[2]')
  })

  test('adding the inputs sets the inputMethods and keystrokes - touch only', () => {
    const inputs: Input[] = [
      {
        answerId: 0,
        inputType: 'T',
        input: '3',
        browserTimestamp: anyTs
      },
      {
        answerId: 0,
        inputType: 'T',
        input: '4',
        browserTimestamp: anyTs
      }
    ]
    sut.addInputs(inputs)
    expect(sut.inputMethods).toBe('t')
    expect(sut.keystrokes).toBe('t[3], t[4]')
  })

  test('adding the inputs sets the inputMethods and keystrokes - pen only', () => {
    const inputs: Input[] = [
      {
        answerId: 0,
        inputType: 'P',
        input: '4',
        browserTimestamp: anyTs
      },
      {
        answerId: 0,
        inputType: 'P',
        input: '4',
        browserTimestamp: anyTs
      }
    ]
    sut.addInputs(inputs)
    expect(sut.inputMethods).toBe('p')
    expect(sut.keystrokes).toBe('p[4], p[4]')
  })

  test('adding the inputs sets the inputMethods and keystrokes - mixed only', () => {
    const inputs: Input[] = [
      {
        answerId: 0,
        inputType: 'K',
        input: '5',
        browserTimestamp: anyTs
      },
      {
        answerId: 0,
        inputType: 'M',
        input: 'Enter',
        browserTimestamp: anyTs
      }
    ]
    sut.addInputs(inputs)
    expect(sut.inputMethods).toBe('x')
    expect(sut.keystrokes).toBe('k[5], m[Enter]')
  })

  test('adding the inputs sets the inputMethods and keystrokes - no input', () => {
    sut.addInputs(null)
    expect(sut.inputMethods).toBe('')
    expect(sut.keystrokes).toBe('')
  })

  test('adding the inputs sets the inputMethods and keystrokes -empty input', () => {
    sut.addInputs([])
    expect(sut.inputMethods).toBe('')
    expect(sut.keystrokes).toBe('')
  })
})

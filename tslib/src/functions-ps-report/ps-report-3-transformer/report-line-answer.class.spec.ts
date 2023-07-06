import { type Input } from '../../functions-ps-report/ps-report-2-pupil-data/models'
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

  describe('the time of the last input is determined correctly', () => {
    test('single digit answer', () => {
      const inputs: Input[] = [
        {
          answerId: 1,
          input: '1',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.123Z')
        }
      ]
      sut.addInputs(inputs)
      expect(sut.lastKey?.toISOString()).toBe('2020-01-21T09:00:05.123Z')
    })

    test('single digit answer with enter', () => {
      const inputs: Input[] = [
        {
          answerId: 1,
          input: '1',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.123Z')
        },
        {
          answerId: 1,
          input: 'Enter',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.650Z')
        }
      ]
      sut.addInputs(inputs)
      expect(sut.lastKey?.toISOString()).toBe('2020-01-21T09:00:05.123Z')
    })

    test('single digit answer with correction', () => {
      const inputs: Input[] = [
        {
          answerId: 1,
          input: '1',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.123Z')
        },
        {
          answerId: 1,
          input: 'Backspace',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.125Z')
        },
        {
          answerId: 1,
          input: '2',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.650Z')
        }
      ]
      sut.addInputs(inputs)
      expect(sut.lastKey?.toISOString()).toBe('2020-01-21T09:00:05.650Z')
    })

    test('single digit answer with enter and correction', () => {
      const inputs: Input[] = [
        {
          answerId: 1,
          input: '1',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.123Z')
        },
        {
          answerId: 1,
          input: 'Backspace',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.125Z')
        },
        {
          answerId: 1,
          input: '2',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.650Z')
        },
        {
          answerId: 1,
          input: 'Enter',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.750Z')
        }
      ]
      sut.addInputs(inputs)
      expect(sut.lastKey?.toISOString()).toBe('2020-01-21T09:00:05.650Z')
    })

    test('single digit answer with trailing extra character', () => {
      const inputs: Input[] = [
        {
          answerId: 1,
          input: '1',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.123Z')
        },
        {
          answerId: 1,
          input: '$',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.723Z')
        }
      ]
      sut.addInputs(inputs)
      expect(sut.lastKey?.toISOString()).toBe('2020-01-21T09:00:05.123Z')
    })

    test('single digit answer with leading extra character', () => {
      const inputs: Input[] = [
        {
          answerId: 1,
          input: '$',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.123Z')
        },
        {
          answerId: 1,
          input: '1',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.663Z')
        }
      ]
      sut.addInputs(inputs)
      expect(sut.lastKey?.toISOString()).toBe('2020-01-21T09:00:05.663Z')
    })

    test('two digit answer', () => {
      const inputs: Input[] = [
        {
          answerId: 1,
          input: '1',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.123Z')
        },
        {
          answerId: 2,
          input: '2',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.663Z')
        }
      ]
      sut.addInputs(inputs)
      expect(sut.lastKey?.toISOString()).toBe('2020-01-21T09:00:05.663Z')
    })

    test('five digit answer', () => {
      const inputs: Input[] = [
        {
          answerId: 1,
          input: '1',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.121Z')
        },
        {
          answerId: 2,
          input: '2',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.122Z')
        },
        {
          answerId: 3,
          input: '3',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.123Z')
        },
        {
          answerId: 4,
          input: '4',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.124Z')
        },
        {
          answerId: 5,
          input: '5',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.125Z')
        }
      ]
      sut.addInputs(inputs)
      expect(sut.lastKey?.toISOString()).toBe('2020-01-21T09:00:05.125Z')
    })

    test('six digit answer', () => {
      const inputs: Input[] = [
        {
          answerId: 1,
          input: '1',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.121Z')
        },
        {
          answerId: 2,
          input: '2',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.122Z')
        },
        {
          answerId: 3,
          input: '3',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.123Z')
        },
        {
          answerId: 4,
          input: '4',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.124Z')
        },
        {
          answerId: 5,
          input: '5',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.125Z')
        },
        {
          answerId: 6,
          input: '6',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.126Z')
        }
      ]
      sut.addInputs(inputs)
      expect(sut.lastKey?.toISOString()).toBe('2020-01-21T09:00:05.125Z')
    })

    test('mixed answer', () => {
      const inputs: Input[] = [
        {
          answerId: 1,
          input: '1',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.121Z')
        },
        {
          answerId: 2,
          input: '#',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.122Z')
        },
        {
          answerId: 3,
          input: 'Backspace',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.123Z')
        },
        {
          answerId: 4,
          input: '4',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.124Z')
        },
        {
          answerId: 5,
          input: 'Backspace',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.125Z')
        },
        {
          answerId: 6,
          input: '6',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.126Z')
        }
      ]
      sut.addInputs(inputs)
      expect(sut.lastKey?.toISOString()).toBe('2020-01-21T09:00:05.126Z')
    })
  })

  describe('the first digit is picked up correctly', () => {
    test('it ignores non-numeric input as the first digit as does not form part of the answer', () => {
      const inputs: Input[] = [
        {
          answerId: 1,
          input: 'x',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.121Z')
        },
        {
          answerId: 2,
          input: '2',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.122Z')
        }
      ]
      sut.addInputs(inputs)
      expect(sut.firstKey?.toISOString()).toBe('2020-01-21T09:00:05.122Z')
    })

    test('it ignores multiple non-numeric inputs as the first digit as does not form part of the answer', () => {
      const inputs: Input[] = [
        {
          answerId: 1,
          input: 'a',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.121Z')
        },
        {
          answerId: 2,
          input: 'b',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.122Z')
        },
        {
          answerId: 3,
          input: 'c',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.123Z')
        },
        {
          answerId: 4,
          input: 'd',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.124Z')
        },
        {
          answerId: 5,
          input: 'x',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.125Z')
        },
        {
          answerId: 2,
          input: '2',
          inputType: 'K',
          browserTimestamp: moment('2020-01-21T09:00:05.127Z')
        }
      ]
      sut.addInputs(inputs)
      expect(sut.firstKey?.toISOString()).toBe('2020-01-21T09:00:05.127Z')
    })
  })
})

import moment from 'moment'
import { type Answer } from '../pupil-data.models'

export const answers: readonly Answer[] = [
  {
    browserTimestamp: moment('2021-01-21T09:00:06.000Z'),
    id: 21,
    inputs: [
      {
        answerId: 21,
        input: '1',
        inputType: 'K',
        browserTimestamp: moment('2021-01-21T09:00:05.123Z')
      }
    ],
    isCorrect: true,
    question: '1x1',
    questionCode: 'Q145',
    questionNumber: 1,
    response: '1'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:15.000Z'),
    id: 22,
    inputs: [
      {
        answerId: 22,
        input: '4',
        inputType: 'M',
        browserTimestamp: moment('2021-01-21T09:00:14.000Z')
      },
      {
        answerId: 22,
        input: '2',
        inputType: 'M',
        browserTimestamp: moment('2021-01-21T09:00:14.333Z')
      },
      {
        answerId: 22,
        input: 'Enter',
        inputType: 'M',
        browserTimestamp: moment('2021-01-21T09:00:15.699Z')
      }
    ],
    isCorrect: false,
    question: '1x2',
    questionCode: 'Q146',
    questionNumber: 2,
    response: '42'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:21.000Z'),
    id: 23,
    inputs: [], // no attempt to answer
    isCorrect: false,
    question: '1x3',
    questionCode: 'Q147',
    questionNumber: 3,
    response: ''
  }
]

import moment from 'moment'
import { Answer } from '../../../functions-throttled/ps-report-2-pupil-data/models'

export const answers: readonly Answer[] = [
  {
    browserTimestamp: moment('2020-01-21T09:00:06.000Z'),
    id: 21,
    inputs: [
      {
        answerId: 21,
        input: '1',
        inputType: 'M',
        browserTimestamp: moment('2020-01-21T09:00:02.123Z')
      }
    ],
    isCorrect: true,
    question: '1x1',
    questionCode: 'Q145',
    response: '1'
  },
  {
    browserTimestamp: moment('2020-01-21T09:00:15.000Z'),
    id: 22,
    inputs: [
      {
        answerId: 22,
        input: '2',
        inputType: 'M',
        browserTimestamp: moment('2020-01-21T09:00:14000Z')
      },
      {
        answerId: 22,
        input: 'Enter',
        inputType: 'M',
        browserTimestamp: moment('2020-01-21T09:00:15.000Z')
      }
    ],
    isCorrect: false,
    question: '1x2',
    questionCode: 'Q146',
    response: '4'
  }
]

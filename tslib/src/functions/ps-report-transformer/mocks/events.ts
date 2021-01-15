import { Event } from '../../../functions-throttled/ps-report-2-pupil-data/models'
import moment from 'moment'

export const events: Event[] = [
  {
    browserTimestamp: moment('2021-01-21T09:00:00.000Z'),
    id: 41,
    isWarmup: false,
    question: '1x1',
    questionCode: 'Q146',
    questionNumber: 1,
    type: 'QuestionRendered'
  },
  {
    browserTimestamp: moment('2020-01-21T09:00:15.500Z'),
    id: 42,
    isWarmup: false,
    question: '1x1',
    questionCode: 'Q146',
    questionNumber: 1,
    type: 'QuestionAnswered'
  }
]

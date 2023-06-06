import type { Event } from '../../../functions-ps-report/ps-report-2-pupil-data/models'
import moment from 'moment'

export const events: Event[] = [
  {
    browserTimestamp: moment('2021-01-21T09:00:01.123Z'),
    id: 40,
    isWarmup: false,
    question: null,
    questionCode: null,
    questionNumber: null,
    type: 'CheckStarted'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:01.500Z'),
    id: 41,
    isWarmup: false,
    question: '1x1',
    questionCode: 'Q146',
    questionNumber: 1,
    type: 'QuestionReaderStart'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:03.678Z'),
    id: 42,
    isWarmup: false,
    question: '1x1',
    questionCode: 'Q146',
    questionNumber: 1,
    type: 'QuestionReaderEnd'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:04.140Z'),
    id: 43,
    isWarmup: false,
    question: '1x1',
    questionCode: 'Q146',
    questionNumber: 1,
    type: 'QuestionRendered'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:04.140Z'),
    id: 44,
    isWarmup: false,
    question: '1x1',
    questionCode: 'Q146',
    questionNumber: 1,
    type: 'QuestionTimerStarted'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:10.500Z'),
    id: 45,
    isWarmup: false,
    question: '1x1',
    questionCode: 'Q146',
    questionNumber: 1,
    type: 'QuestionTimerEnded'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:13.123Z'),
    id: 46,
    isWarmup: false,
    question: '1x2',
    questionCode: 'Q146',
    questionNumber: 1,
    type: 'QuestionRendered'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:13.124Z'),
    id: 47,
    isWarmup: false,
    question: '1x2',
    questionCode: 'Q147',
    questionNumber: 2,
    type: 'QuestionTimerStarted'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:15.700Z'),
    id: 48,
    isWarmup: false,
    question: '1x2',
    questionCode: 'Q147',
    questionNumber: 2,
    type: 'QuestionAnswered'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:18.790Z'),
    id: 49,
    isWarmup: false,
    question: '1x3',
    questionCode: 'Q148',
    questionNumber: 3,
    type: 'QuestionTimerStarted'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:21.000Z'),
    id: 50,
    isWarmup: false,
    question: '1x3',
    questionCode: 'Q148',
    questionNumber: 3,
    type: 'QuestionTimerEnded'
  },
  {
    browserTimestamp: moment('2021-01-21T09:00:21.001Z'),
    id: 51,
    isWarmup: false,
    question: null,
    questionCode: null,
    questionNumber: null,
    type: 'CheckComplete'
  }
]

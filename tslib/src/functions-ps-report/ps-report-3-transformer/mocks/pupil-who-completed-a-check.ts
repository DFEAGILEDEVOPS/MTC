import { Pupil } from '../../../functions-throttled/ps-report-2-pupil-data/models'
import moment from 'moment'

export const pupil: Pupil = {
  checkComplete: true,
  currentCheckId: 1,
  dateOfBirth: moment.utc('2012-03-07'),
  forename: 'test',
  gender: 'F',
  id: 2,
  lastname: 'data',
  notTakingCheckReason: null,
  notTakingCheckCode: null,
  slug: 'abc-def-hij-klm',
  schoolId: 3,
  upn: 'TEST987'
}

import { Pupil } from '../../../functions-throttled/ps-report-2-pupil-data/models'
import moment from 'moment'

export const pupil: Pupil = {
  attendanceId: null,
  checkComplete: false,
  currentCheckId: 1,
  dateOfBirth: moment.utc('2012-02-03'),
  forename: 'abc',
  gender: 'M',
  id: 3,
  lastname: 'def',
  notTakingCheckReason: null,
  slug: 'abc-def-hij-klm',
  schoolId: 3,
  upn: 'TEST985'
}

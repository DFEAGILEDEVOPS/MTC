import { Pupil } from '../../../functions-throttled/ps-report-2-pupil-data/models'
import moment from 'moment'

export const pupil: Pupil = {
  attendanceId: 1,
  checkComplete: null,
  currentCheckId: null,
  dateOfBirth: moment.utc('2012-04-01'),
  forename: 'Tester',
  gender: 'M',
  id: 3,
  lastname: 'Person',
  notTakingCheckReason: 'Absent during check window',
  slug: 'abc-def-hij-klm',
  schoolId: 3,
  upn: 'TEST986'
}

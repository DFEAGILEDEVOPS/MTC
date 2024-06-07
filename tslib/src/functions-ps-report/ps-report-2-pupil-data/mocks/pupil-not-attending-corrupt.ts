import type { Pupil } from '../pupil-data.models'
import moment from 'moment'

export const pupil: Pupil = {
  checkComplete: true,
  currentCheckId: null,
  dateOfBirth: moment.utc('2012-04-01'),
  forename: 'Tester',
  gender: 'M',
  id: 4,
  isEdited: false,
  jobId: 1,
  lastname: 'Person',
  middlenames: 'Other',
  notTakingCheckReason: 'Absent during check window',
  notTakingCheckCode: 'ABSNT',
  restartAvailable: false,
  slug: 'abc-def-hij-klm',
  schoolId: 4,
  upn: 'TEST987'
}

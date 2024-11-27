import type { Pupil } from '../pupil-data.models'
import moment from 'moment'

// An pupil who completed a check and was then annulled for cheating.
export const pupil: Pupil = {
  checkComplete: false,
  currentCheckId: 2,
  dateOfBirth: moment.utc('2012-04-01'),
  forename: 'Tester',
  gender: 'M',
  id: 4,
  isEdited: false,
  jobId: 1,
  lastname: 'Person',
  notTakingCheckReason: 'Pupil Cheating',
  notTakingCheckCode: 'ANLLH',
  middlenames: 'middle name',
  restartAvailable: false,
  slug: 'abc-def-hij-klm',
  schoolId: 3,
  upn: 'TEST987'
}

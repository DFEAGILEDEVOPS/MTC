import type { Pupil } from '../pupil-data.models'
import moment from 'moment'

export const pupil: Pupil = {
  checkComplete: false,
  currentCheckId: 1,
  dateOfBirth: moment.utc('2012-04-01'),
  forename: 'Tester',
  gender: 'M',
  id: 3,
  isEdited: false,
  jobId: 1,
  lastname: 'Person',
  notTakingCheckReason: 'Maladministration',
  notTakingCheckCode: 'ANLLQ',
  middlenames: 'middle name',
  restartAvailable: false,
  slug: 'abc-def-hij-klm',
  schoolId: 3,
  upn: 'TEST986'
}

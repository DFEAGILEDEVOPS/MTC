import type { Pupil } from '../pupil-data.models'
import moment from 'moment'

export const pupil: Pupil = {
  checkComplete: true,
  currentCheckId: 6,
  dateOfBirth: moment.utc('2012-02-03'),
  forename: 'abc',
  gender: 'M',
  id: 3,
  isEdited: true,
  jobId: 1,
  lastname: 'def',
  middlenames: 'Name',
  notTakingCheckReason: null,
  notTakingCheckCode: null,
  restartAvailable: true,
  slug: 'abc-def-hij-klm',
  schoolId: 3,
  upn: 'TEST987'
}

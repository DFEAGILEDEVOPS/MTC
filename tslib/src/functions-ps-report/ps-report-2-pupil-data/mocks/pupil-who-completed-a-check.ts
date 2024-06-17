import { type Pupil } from '../pupil-data.models'
import moment from 'moment'

export const pupil: Pupil = {
  checkComplete: true,
  currentCheckId: 1,
  dateOfBirth: moment.utc('2012-03-07'),
  forename: 'test',
  gender: 'F',
  id: 2,
  isEdited: true,
  jobId: 1,
  lastname: 'data',
  middlenames: 'middle names',
  notTakingCheckReason: null,
  notTakingCheckCode: null,
  restartAvailable: false,
  slug: 'abc-def-hij-klm',
  schoolId: 3,
  upn: 'TEST987'
}

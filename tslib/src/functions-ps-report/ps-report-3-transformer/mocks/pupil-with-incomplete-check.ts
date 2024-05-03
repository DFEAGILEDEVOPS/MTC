import { type Pupil } from '../../../functions-ps-report/ps-report-2-pupil-data/models'
import moment from 'moment'

export const pupil: Pupil = {
  checkComplete: false,
  currentCheckId: 1,
  dateOfBirth: moment.utc('2012-02-03'),
  forename: 'abc',
  gender: 'M',
  id: 3,
  isEdited: false,
  jobId: 1,
  lastname: 'def',
  middlenames: 'Other',
  notTakingCheckReason: null,
  notTakingCheckCode: null,
  restartAvailable: false,
  slug: 'abc-def-hij-klm',
  schoolId: 3,
  upn: 'TEST985'
}

import { Pupil } from '../../ps-report-2-pupil-data/models'
import moment from 'moment'

export const pupil: Pupil = {
  checkComplete: null,
  currentCheckId: null,
  dateOfBirth: moment.utc('2012-04-01'),
  forename: 'Tester',
  gender: 'M',
  id: 3,
  jobId: 1,
  lastname: 'Person',
  notTakingCheckReason: 'Results annulled',
  notTakingCheckCode: 'ANLLD',
  restartAvailable: false,
  slug: 'abc-def-hij-klm',
  schoolId: 3,
  upn: 'TEST986'
}

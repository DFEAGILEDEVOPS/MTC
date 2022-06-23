import { PupilFrozenDataService } from '../../pupil-frozen.service/pupil-frozen.data.service'
const attendanceService = require('../../attendance.service')
import{ validate as validateUuid } from 'uuid'
import { PupilAnnulmentDataService } from './pupil-annulment.data.service'

export class PupilAnnulmentService {

  static async applyAnnulment (pupilUrlSlug: string, pupilSchoolId: number, serviceManagerUserId: number): Promise<void> {
    if (pupilUrlSlug === undefined) {
      throw new Error('pupilUrlSlug is required')
    }
    if (!validateUuid(pupilUrlSlug)) {
      throw new Error('a valid uuid is required for pupilUrlSlug')
    }
    return PupilAnnulmentDataService.setAnnulmentByUrlSlug(pupilUrlSlug, serviceManagerUserId)
  }

  static async removeAnnulment (pupilUrlSlug: string, pupilSchoolId: number, preserveFreeze: boolean): Promise<void> {
    if (pupilUrlSlug === undefined) {
      throw new Error('pupilUrlSlug is required')
    }

    if (!validateUuid(pupilUrlSlug)) {
      throw new Error('a valid uuid is required for pupilUrlSlug')
    }
    throw new Error('not implemented')
  }
}

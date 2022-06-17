import { PupilFrozenDataService } from '../../pupil-frozen.service/pupil-frozen.data.service'
const attendanceService = require('../../attendance.service')
import{ validate as validateUuid } from 'uuid'

export class PupilAnnulmentService {
  private static readonly annulmentCode = 'ABC'

  static async applyAnnulment (pupilUrlSlug: string, serviceManagerUserId): Promise<void> {
    if (pupilUrlSlug === undefined) {
      throw new Error('pupilUrlSlug is required')
    }

    if (!validateUuid(pupilUrlSlug)) {
      throw new Error('a valid uuid is required for pupilUrlSlug')
    }
    await PupilFrozenDataService.freezePupil(pupilUrlSlug)
    return attendanceService.updatePupilAttendanceBySlug([pupilUrlSlug], this.annulmentCode, serviceManagerUserId, null)
  }

  static async removeAnnulment (pupilUrlSlug: string): Promise<void> {
    if (pupilUrlSlug === undefined) {
      throw new Error('pupilUrlSlug is required')
    }

    if (!validateUuid(pupilUrlSlug)) {
      throw new Error('a valid uuid is required for pupilUrlSlug')
    }
  }
}

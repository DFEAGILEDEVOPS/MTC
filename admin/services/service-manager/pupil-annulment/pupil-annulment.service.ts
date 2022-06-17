import { PupilFrozenDataService } from '../../pupil-frozen.service/pupil-frozen.data.service'
const attendanceService = require('../../attendance.service')
import{ validate as validateUuid } from 'uuid'

export class PupilAnnulmentService {
  public static readonly annulmentCode = 'ANLLD'

  static async applyAnnulment (pupilUrlSlug: string, pupilSchoolId: number, serviceManagerUserId: number): Promise<void> {
    if (pupilUrlSlug === undefined) {
      throw new Error('pupilUrlSlug is required')
    }
    if (!validateUuid(pupilUrlSlug)) {
      throw new Error('a valid uuid is required for pupilUrlSlug')
    }
    await PupilFrozenDataService.freezePupil(pupilUrlSlug)
    return attendanceService.updatePupilAttendanceBySlug([pupilUrlSlug], this.annulmentCode, serviceManagerUserId, pupilSchoolId)
  }

  static async removeAnnulment (pupilUrlSlug: string, pupilSchoolId: number, preserveFreeze: boolean): Promise<void> {
    if (pupilUrlSlug === undefined) {
      throw new Error('pupilUrlSlug is required')
    }

    if (!validateUuid(pupilUrlSlug)) {
      throw new Error('a valid uuid is required for pupilUrlSlug')
    }

    if (!preserveFreeze) {
      await PupilFrozenDataService.thawPupil(pupilUrlSlug)
    }
    return attendanceService.unsetAttendanceCode(pupilUrlSlug, pupilSchoolId)
  }
}

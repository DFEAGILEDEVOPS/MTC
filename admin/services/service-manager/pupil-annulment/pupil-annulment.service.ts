import{ validate as validateUuid } from 'uuid'
import { PupilAnnulmentDataService } from './pupil-annulment.data.service'

export class PupilAnnulmentService {

  static async applyAnnulment (pupilUrlSlug: string, serviceManagerUserId: number): Promise<void> {
    if (pupilUrlSlug === undefined) {
      throw new Error('pupilUrlSlug is required')
    }
    if (!validateUuid(pupilUrlSlug)) {
      throw new Error('a valid uuid is required for pupilUrlSlug')
    }
    return PupilAnnulmentDataService.setAnnulmentByUrlSlug(pupilUrlSlug, serviceManagerUserId)
  }

  static async removeAnnulment (pupilUrlSlug: string, serviceManagerUserId: number): Promise<void> {
    if (pupilUrlSlug === undefined) {
      throw new Error('pupilUrlSlug is required')
    }

    if (!validateUuid(pupilUrlSlug)) {
      throw new Error('a valid uuid is required for pupilUrlSlug')
    }
    return PupilAnnulmentDataService.undoAnnulmentByUrlSlug(pupilUrlSlug, serviceManagerUserId)
  }
}

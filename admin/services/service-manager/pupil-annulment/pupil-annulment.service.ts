import { PupilFrozenDataService } from '../../pupil-frozen.service/pupil-frozen.data.service'

export class PupilAnnulmentService {
  static async applyAnnulment (pupilId: number): Promise<void> {
    if (pupilId === undefined) {
      throw new Error('pupilId is required')
    }
    return PupilFrozenDataService.freezePupil(pupilId)
    throw new Error('set attendance code to annuled')
  }

  static async removeAnnulment (): Promise<void> {
    throw new Error('todo')
  }
}

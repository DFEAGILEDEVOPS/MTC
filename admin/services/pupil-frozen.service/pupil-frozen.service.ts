
const pupilDataService = require('../data-access/pupil.data.service')

export class PupilFrozenService {
  static async throwIfFrozen (pupilId: number): Promise<void> {
    if (pupilId === undefined) throw new Error('pupilId is required')
    const frozenResult = await pupilDataService.isFrozen(pupilId)
    const isFrozen = frozenResult[0].frozen
    if (isFrozen) {
      throw new Error('Pupil record is frozen and cannot be edited')
    }
  }
}

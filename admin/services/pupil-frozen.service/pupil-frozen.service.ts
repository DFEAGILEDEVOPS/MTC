
const pupilDataService = require('../data-access/pupil.data.service')

export class PupilFrozenService {
  static async throwIfFrozenById (pupilId: number): Promise<void> {
    if (pupilId === undefined) throw new Error('pupilId is required')
    const frozenResult = await pupilDataService.isFrozen(pupilId)
    const isFrozen = frozenResult[0].frozen
    this.throwIfFrozen(isFrozen)
  }

  static async throwIfFrozenByUrlSlug (pupilUrlSlug: string): Promise<void> {
    if (pupilUrlSlug === undefined) throw new Error('pupilUrlSlug is required')
    const frozenResult = await pupilDataService.isFrozenByUrlSlug(pupilUrlSlug)
    const isFrozen = frozenResult[0].frozen
    this.throwIfFrozen(isFrozen)
  }

  private static throwIfFrozen (frozenFlag: boolean): void {
    if (frozenFlag) {
      throw new Error('Pupil record is frozen and cannot be edited')
    }
  }
}

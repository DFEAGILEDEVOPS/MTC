
const pupilDataService = require('../data-access/pupil.data.service')

export class PupilFrozenService {
  static async throwIfFrozenById (pupilId: number): Promise<void> {
    if (pupilId === undefined) throw new Error('pupilId is required')
    const frozenResult = await pupilDataService.isFrozen(pupilId)
    const isFrozen = frozenResult[0].frozen
    this.throwIfFrozen(isFrozen)
  }

  static async throwIfFrozenByUrlSlugs (pupilUrlSlugs: Array<string>): Promise<void> {
    if (pupilUrlSlugs === undefined) throw new Error('pupilUrlSlugs is required')
    if (pupilUrlSlugs.length === 0) return
    const frozenResult = await pupilDataService.countFrozenByUrlSlugs(pupilUrlSlugs)
    this.throwIfFrozen(frozenResult[0].frozenCount > 0, 'one or more pupils are frozen')
  }

  private static throwIfFrozen (frozenFlag: boolean, errorMsg: string = 'Pupil record is frozen and cannot be edited'): void {
    if (frozenFlag) {
      throw new Error(errorMsg)
    }
  }
}


const { PupilFrozenDataService } = require('./pupil-frozen.data.service')

export class PupilFrozenService {
  static async throwIfFrozenByIds (pupilIds: Array<number>): Promise<void> {
    if (pupilIds === undefined) throw new Error('pupilIds is required')
    if (pupilIds.length === 0) return
    const frozenResult = await PupilFrozenDataService.getFrozenCountByPupilIds(pupilIds)
    this.throwIfFrozen(frozenResult[0].frozenCount > 0, 'frozen pupils cannot be modified')
  }

  static async throwIfFrozenByUrlSlugs (pupilUrlSlugs: Array<string>): Promise<void> {
    if (pupilUrlSlugs === undefined) throw new Error('pupilUrlSlugs is required')
    if (pupilUrlSlugs.length === 0) return
    const frozenResult = await PupilFrozenDataService.getFrozenCountByUrlSlugs(pupilUrlSlugs)
    this.throwIfFrozen(frozenResult[0].frozenCount > 0, 'frozen pupils cannot be modified')
  }

  private static throwIfFrozen (frozenFlag: boolean, errorMsg: string = 'Pupil record is frozen and cannot be edited'): void {
    if (frozenFlag) {
      throw new Error(errorMsg)
    }
  }
}

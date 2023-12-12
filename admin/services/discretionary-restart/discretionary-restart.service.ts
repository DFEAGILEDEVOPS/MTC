import { PupilFrozenService } from '../pupil-frozen/pupil-frozen.service'
import * as uuid from 'uuid'
import { DiscretionaryRestartDataService } from './data-access/discretionary-restart.data.service'
import { isNumber } from 'ramda-adjunct'

export class DiscretionaryRestartService {
  public static async grantDiscretionaryRestart (pupilSlug: string, userId: number): Promise<void> {
    if (uuid.validate(pupilSlug) === false) {
      throw new Error('Invalid uuid')
    }
    if (isNumber(userId) === false) {
      throw new Error('Invalid userId')
    }
    await PupilFrozenService.throwIfFrozenByUrlSlugs([pupilSlug])
    await DiscretionaryRestartDataService.sqlGrantDiscretionaryRestart(pupilSlug, userId)
  }

  public static async removeDiscretionaryRestart (pupilSlug: string, userId: number): Promise<void> {
    if (uuid.validate(pupilSlug) === false) {
      throw new Error('Invalid uuid')
    }
    if (isNumber(userId) === false) {
      throw new Error('Invalid userId')
    }
    await PupilFrozenService.throwIfFrozenByUrlSlugs([pupilSlug])
    await DiscretionaryRestartDataService.sqlRevokeDiscretionaryRestart(pupilSlug, userId)
  }
}

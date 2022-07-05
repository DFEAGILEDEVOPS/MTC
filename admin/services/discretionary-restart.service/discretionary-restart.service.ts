import { PupilFrozenService } from '../pupil-frozen.service/pupil-frozen.service'
import * as uuid from 'uuid'
import { DiscretionaryRestartDataService } from './data-access/discretionary-restart.data.service'

export class DiscretionaryRestartService {
  public static async grantDiscretionaryRestart (pupilSlug: string): Promise<void> {
    if (uuid.validate(pupilSlug) === false) {
      throw new Error('Invalid uuid')
    }
    await PupilFrozenService.throwIfFrozenByUrlSlugs([pupilSlug])
    await DiscretionaryRestartDataService.sqlGrantDiscretionaryRestart(pupilSlug)
  }

  public static async removeDiscretionaryRestart (pupilSlug: string): Promise<void> {
    if (uuid.validate(pupilSlug) === false) {
      throw new Error('Invalid uuid')
    }
    await PupilFrozenService.throwIfFrozenByUrlSlugs([pupilSlug])
    await DiscretionaryRestartDataService.sqlRevokeDiscretionaryRestart(pupilSlug)
  }
}

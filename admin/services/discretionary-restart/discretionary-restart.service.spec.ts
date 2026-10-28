import { DiscretionaryRestartService } from './discretionary-restart.service'
import { DiscretionaryRestartDataService } from './data-access/discretionary-restart.data.service'
import * as uuid from 'uuid'
import { PupilFrozenService } from '../pupil-frozen/pupil-frozen.service'

const userId = 456

describe('DiscretationryRestartService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockImplementation()
  })

  describe('grantDiscretionaryRestart', () => {
    test('it validates that a uuid has been passed in', async () => {
      await expect(DiscretionaryRestartService.grantDiscretionaryRestart('not a valid uuid', userId)).rejects.toThrow(/Invalid uuid/)
    })

    test('it throws if the pupil is frozen', async () => {
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockRejectedValue(new Error('frozen'))
      await expect(DiscretionaryRestartService.grantDiscretionaryRestart('6be328e1-6604-4626-b31a-ed0686b01ed3', userId)).rejects.toThrow('frozen')
    })

    test('it calls the data service', async () => {
      jest.spyOn(DiscretionaryRestartDataService, 'sqlGrantDiscretionaryRestart').mockImplementation()
      const slug = uuid.v4()
      await DiscretionaryRestartService.grantDiscretionaryRestart(slug, userId)
      expect(DiscretionaryRestartDataService.sqlGrantDiscretionaryRestart).toHaveBeenCalledWith(slug, userId)
    })
  })

  describe('removeDiscretionaryRestart', () => {
    test('it validates that a uuid has been passed in', async () => {
      await expect(DiscretionaryRestartService.removeDiscretionaryRestart('not a valid uuid', userId)).rejects.toThrow(/Invalid uuid/)
    })

    test('it throws if the pupil is frozen', async () => {
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockRejectedValue(new Error('frozen'))
      await expect(DiscretionaryRestartService.removeDiscretionaryRestart('6be328e1-6604-4626-b31a-ed0686b01ed3', userId)).rejects.toThrow('frozen')
    })

    test('it calls the data service', async () => {
      jest.spyOn(DiscretionaryRestartDataService, 'sqlRevokeDiscretionaryRestart').mockImplementation()
      const pupilUuid = uuid.v4()
      await DiscretionaryRestartService.removeDiscretionaryRestart(pupilUuid, userId)
      expect(DiscretionaryRestartDataService.sqlRevokeDiscretionaryRestart).toHaveBeenCalledWith(pupilUuid, userId)
    })
  })
})

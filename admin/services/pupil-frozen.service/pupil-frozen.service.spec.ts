import { PupilFrozenService } from './pupil-frozen.service';
const pupilDataService = require('../data-access/pupil.data.service')

describe('Pupil Frozen Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('throwIfFrozen', () => {
    test('throws an error if pupilId is undefined', async () => {
      const x = undefined
      await expect(PupilFrozenService.throwIfFrozen(x)).rejects.toThrow('pupilId is required')
    })

    test('throws an error if pupil is frozen', async () => {
      jest.spyOn(pupilDataService, 'isFrozen').mockReturnValue([{
        frozen: true
      }])
      await expect(PupilFrozenService.throwIfFrozen(1)).rejects.toThrow('Pupil record is frozen and cannot be edited')
    })

    test('does not throw an error if pupil is not frozen', async () => {
      jest.spyOn(pupilDataService, 'isFrozen').mockReturnValue([{
        frozen: false
      }])
      await expect(PupilFrozenService.throwIfFrozen(1)).resolves.toBeUndefined()
    })
  })
})

import { PupilFrozenService } from './pupil-frozen.service';
const pupilDataService = require('../data-access/pupil.data.service')

describe('Pupil Frozen Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('throwIfFrozenById', () => {
    test('throws an error if pupilId is undefined', async () => {
      const x = undefined
      await expect(PupilFrozenService.throwIfFrozenById(x)).rejects.toThrow('pupilId is required')
    })

    test('throws an error if pupil is frozen', async () => {
      jest.spyOn(pupilDataService, 'isFrozen').mockReturnValue([{
        frozen: true
      }])
      await expect(PupilFrozenService.throwIfFrozenById(1)).rejects.toThrow('Pupil record is frozen and cannot be edited')
    })

    test('does not throw an error if pupil is not frozen', async () => {
      jest.spyOn(pupilDataService, 'isFrozen').mockReturnValue([{
        frozen: false
      }])
      await expect(PupilFrozenService.throwIfFrozenById(1)).resolves.toBeUndefined()
    })
  })

  describe('throwIfFrozenByUrlSlug', () => {
    test('throws an error if pupilUrlSlug is undefined', async () => {
      const x = undefined
      await expect(PupilFrozenService.throwIfFrozenByUrlSlug(x)).rejects.toThrow('pupilUrlSlug is required')
    })

    test('throws an error if pupil is frozen', async () => {
      jest.spyOn(pupilDataService, 'isFrozenByUrlSlug').mockReturnValue([{
        frozen: true
      }])
      await expect(PupilFrozenService.throwIfFrozenByUrlSlug('856ed79a-1fc9-4c14-bb32-dc7e026a6c3f'))
        .rejects.toThrow('Pupil record is frozen and cannot be edited')
    })

    test('does not throw an error if pupil is not frozen', async () => {
      jest.spyOn(pupilDataService, 'isFrozenByUrlSlug').mockReturnValue([{
        frozen: false
      }])
      await expect(PupilFrozenService.throwIfFrozenByUrlSlug('856ed79a-1fc9-4c14-bb32-dc7e026a6c3f'))
        .resolves.toBeUndefined()
    })
  })

  describe('throwIfFrozenByUrlSlugs', () => {
    test('throws an error if pupilUrlSlugs is undefined', async () => {
      const x = undefined
      await expect(PupilFrozenService.throwIfFrozenByUrlSlugs(x)).rejects.toThrow('pupilUrlSlugs is required')
    })

    test('exits early if pupilUrlSlugs is empty', async () => {
      jest.spyOn(pupilDataService, 'countFrozenByUrlSlugs').mockImplementation()
      const x = []
      await PupilFrozenService.throwIfFrozenByUrlSlugs(x)
      expect(pupilDataService.countFrozenByUrlSlugs).not.toHaveBeenCalled()
    })

    test('throws an error if one pupil in set is frozen', async () => {
      const slugs: Array<string> = [
        '985d8211-0bed-44c1-ab58-b08e6ec9ed58',
        '79de5922-1180-4f9c-9d8a-b3e5e6e59829',
        '6d0229ef-9eba-4d9a-b884-a41cbe63b2fd'
      ]
      jest.spyOn(pupilDataService, 'countFrozenByUrlSlugs').mockReturnValue([{
        frozenCount: 1
      }])
      await expect(PupilFrozenService.throwIfFrozenByUrlSlugs(slugs)).rejects.toThrow('one or more pupils are frozen')
    })

  })
})

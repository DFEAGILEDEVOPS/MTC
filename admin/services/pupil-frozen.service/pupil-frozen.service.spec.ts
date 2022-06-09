import { PupilFrozenDataService } from './pupil-frozen.data.service'
import { PupilFrozenService } from './pupil-frozen.service';

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
      jest.spyOn(PupilFrozenDataService, 'isFrozen').mockResolvedValue([{
        frozen: true
      }])
      await expect(PupilFrozenService.throwIfFrozenById(1)).rejects.toThrow('Pupil record is frozen and cannot be edited')
    })

    test('does not throw an error if pupil is not frozen', async () => {
      jest.spyOn(PupilFrozenDataService, 'isFrozen').mockResolvedValue([{
        frozen: false
      }])
      await expect(PupilFrozenService.throwIfFrozenById(1)).resolves.toBeUndefined()
    })
  })

  describe('throwIfFrozenByUrlSlugs', () => {
    test('throws an error if pupilUrlSlugs is undefined', async () => {
      const x = undefined
      await expect(PupilFrozenService.throwIfFrozenByUrlSlugs(x)).rejects.toThrow('pupilUrlSlugs is required')
    })

    test('exits early if pupilUrlSlugs is empty', async () => {
      jest.spyOn(PupilFrozenDataService, 'countFrozenByUrlSlugs').mockImplementation()
      const x = []
      await PupilFrozenService.throwIfFrozenByUrlSlugs(x)
      expect(PupilFrozenDataService.countFrozenByUrlSlugs).not.toHaveBeenCalled()
    })

    test('throws an error if one pupil in set is frozen', async () => {
      const slugs: Array<string> = [
        '985d8211-0bed-44c1-ab58-b08e6ec9ed58',
        '79de5922-1180-4f9c-9d8a-b3e5e6e59829',
        '6d0229ef-9eba-4d9a-b884-a41cbe63b2fd'
      ]
      jest.spyOn(PupilFrozenDataService, 'countFrozenByUrlSlugs').mockResolvedValue([{
        frozenCount: 1
      }])
      await expect(PupilFrozenService.throwIfFrozenByUrlSlugs(slugs)).rejects.toThrow('one or more pupils are frozen')
    })

    test('throws an error if more than one pupil in set is frozen', async () => {
      const slugs: Array<string> = [
        '985d8211-0bed-44c1-ab58-b08e6ec9ed58',
        '79de5922-1180-4f9c-9d8a-b3e5e6e59829',
        '6d0229ef-9eba-4d9a-b884-a41cbe63b2fd',
        '27a07106-a579-4755-b45f-01035d14a859',
        '06efbfe4-c9ac-4033-803e-9841e411b3eb',
        'c5146bc2-1f73-4bde-b66b-ca84cb397ceb'
      ]
      jest.spyOn(PupilFrozenDataService, 'countFrozenByUrlSlugs').mockResolvedValue([{
        frozenCount: 3
      }])
      await expect(PupilFrozenService.throwIfFrozenByUrlSlugs(slugs)).rejects.toThrow('one or more pupils are frozen')
    })

    test('does not throw an error if no pupils in set are frozen', async () => {
      const slugs: Array<string> = [
        '985d8211-0bed-44c1-ab58-b08e6ec9ed58',
        '79de5922-1180-4f9c-9d8a-b3e5e6e59829',
        '6d0229ef-9eba-4d9a-b884-a41cbe63b2fd',
        '27a07106-a579-4755-b45f-01035d14a859',
        '06efbfe4-c9ac-4033-803e-9841e411b3eb',
        'c5146bc2-1f73-4bde-b66b-ca84cb397ceb'
      ]
      jest.spyOn(PupilFrozenDataService, 'countFrozenByUrlSlugs').mockResolvedValue([{
        frozenCount: 0
      }])
      await PupilFrozenService.throwIfFrozenByUrlSlugs(slugs)
      expect(PupilFrozenDataService.countFrozenByUrlSlugs).toHaveBeenCalledTimes(1)
    })
  })
})

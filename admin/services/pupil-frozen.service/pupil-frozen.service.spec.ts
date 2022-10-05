import { PupilFrozenDataService } from './pupil-frozen.data.service'
import { PupilFrozenService } from './pupil-frozen.service'

describe('Pupil Frozen Service', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('throwIfFrozenByIds', () => {
    test('exits early if pupilIds is empty', async () => {
      jest.spyOn(PupilFrozenDataService, 'getFrozenCountByPupilIds').mockImplementation()
      const x: number[] = []
      await PupilFrozenService.throwIfFrozenByIds(x)
      expect(PupilFrozenDataService.getFrozenCountByPupilIds).not.toHaveBeenCalled()
    })

    test('throws an error if pupilIds is undefined', async () => {
      // @ts-ignore:next-line assert if undefined handled correctly at runtime
      await expect(PupilFrozenService.throwIfFrozenByIds(undefined)).rejects.toThrow('pupilIds is required')
    })

    test('throws an error if one pupil is frozen', async () => {
      jest.spyOn(PupilFrozenDataService, 'getFrozenCountByPupilIds').mockResolvedValue(1)
      await expect(PupilFrozenService.throwIfFrozenByIds([1, 2, 3, 4])).rejects.toThrow('frozen pupils cannot be modified')
    })

    test('does not throw an error if no pupils in set are frozen', async () => {
      jest.spyOn(PupilFrozenDataService, 'getFrozenCountByPupilIds').mockResolvedValue(0)
      await expect(PupilFrozenService.throwIfFrozenByIds([1, 2, 3, 4])).resolves.toBeUndefined()
    })
  })

  describe('throwIfFrozenByUrlSlugs', () => {
    test('throws an error if pupilUrlSlugs is undefined', async () => {
      // @ts-ignore:next-line assert if undefined handled correctly at runtime
      await expect(PupilFrozenService.throwIfFrozenByUrlSlugs(undefined)).rejects.toThrow('pupilUrlSlugs is required')
    })

    test('exits early if pupilUrlSlugs is empty', async () => {
      jest.spyOn(PupilFrozenDataService, 'getFrozenCountByUrlSlugs').mockImplementation()
      const x: string[] = []
      await PupilFrozenService.throwIfFrozenByUrlSlugs(x)
      expect(PupilFrozenDataService.getFrozenCountByUrlSlugs).not.toHaveBeenCalled()
    })

    test('throws an error if one pupil in set is frozen', async () => {
      const slugs: string[] = [
        '985d8211-0bed-44c1-ab58-b08e6ec9ed58',
        '79de5922-1180-4f9c-9d8a-b3e5e6e59829',
        '6d0229ef-9eba-4d9a-b884-a41cbe63b2fd'
      ]
      jest.spyOn(PupilFrozenDataService, 'getFrozenCountByUrlSlugs').mockResolvedValue(1)
      await expect(PupilFrozenService.throwIfFrozenByUrlSlugs(slugs)).rejects.toThrow('frozen pupils cannot be modified')
    })

    test('throws an error if more than one pupil in set is frozen', async () => {
      const slugs: string[] = [
        '985d8211-0bed-44c1-ab58-b08e6ec9ed58',
        '79de5922-1180-4f9c-9d8a-b3e5e6e59829',
        '6d0229ef-9eba-4d9a-b884-a41cbe63b2fd',
        '27a07106-a579-4755-b45f-01035d14a859',
        '06efbfe4-c9ac-4033-803e-9841e411b3eb',
        'c5146bc2-1f73-4bde-b66b-ca84cb397ceb'
      ]
      jest.spyOn(PupilFrozenDataService, 'getFrozenCountByUrlSlugs').mockResolvedValue(3)
      await expect(PupilFrozenService.throwIfFrozenByUrlSlugs(slugs)).rejects.toThrow('frozen pupils cannot be modified')
    })

    test('does not throw an error if no pupils in set are frozen', async () => {
      const slugs: string[] = [
        '985d8211-0bed-44c1-ab58-b08e6ec9ed58',
        '79de5922-1180-4f9c-9d8a-b3e5e6e59829',
        '6d0229ef-9eba-4d9a-b884-a41cbe63b2fd',
        '27a07106-a579-4755-b45f-01035d14a859',
        '06efbfe4-c9ac-4033-803e-9841e411b3eb',
        'c5146bc2-1f73-4bde-b66b-ca84cb397ceb'
      ]
      jest.spyOn(PupilFrozenDataService, 'getFrozenCountByUrlSlugs').mockResolvedValue(0)
      await PupilFrozenService.throwIfFrozenByUrlSlugs(slugs)
      expect(PupilFrozenDataService.getFrozenCountByUrlSlugs).toHaveBeenCalledTimes(1)
    })
  })
})

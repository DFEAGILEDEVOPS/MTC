
const sut = require('../../../helpers/result-presenter')

describe('resultPresenter', () => {
  describe('presentPupilData', () => {
    test('is defined', () => {
      expect(sut.presentPupilData).toBeDefined()
    })

    test('returns a dash for a null score', () => {
      const pupil = { score: null }
      const res = sut.presentPupilData(pupil)
      expect(res.score).toBe('-')
    })

    test('returns a dash for an undefined score', () => {
      const pupil = { score: undefined }
      const res = sut.presentPupilData(pupil)
      expect(res.score).toBe('-')
    })

    test('handles a zero score', () => {
      const pupil = { score: 0 }
      const res = sut.presentPupilData(pupil)
      expect(res.score).toBe(0)
    })

    test('handles a positive score', () => {
      const pupil = { score: 25 }
      const res = sut.presentPupilData(pupil)
      expect(res.score).toBe(25)
    })
  })
})


const moment = require('moment')
const pupilPresenter = require('../../../helpers/pupil-presenter')

describe('pupilPresenter', () => {
  describe('getPupilExampleYear', () => {
    test('fetches the example pupil year', () => {
      const deductionYears = 8
      const exampleYear = pupilPresenter.getPupilExampleYear()
      expect(exampleYear).toBe(moment.utc().format('YYYY') - deductionYears)
    })
  })

  describe('getPupilsSortedWithIdentificationFlags', () => {
    test('sorts the pupils and adds identification flags', () => {
      const pupils = [
        { foreName: 'Tom', lastName: 'Smith', id: 1, dateOfBirth: moment(), middleNames: '' },
        { foreName: 'Bob', lastName: 'Smith', id: 2, dateOfBirth: moment(), middleNames: '' },
        { foreName: 'Sam', lastName: 'Grant', id: 3, dateOfBirth: moment(), middleNames: '' }
      ]
      const res = pupilPresenter.getPupilsSortedWithIdentificationFlags(pupils)
      expect(res[0].id).toEqual(3)
      expect(res[1].id).toEqual(2)
      expect(res[2].id).toEqual(1)
    })
  })
})

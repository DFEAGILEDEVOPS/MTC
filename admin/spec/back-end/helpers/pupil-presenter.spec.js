/* global describe, expect, it  */
const moment = require('moment')

const pupilPresenter = require('../../../helpers/pupil-presenter')

describe('pupilPresenter', () => {
  describe('getPupilExampleYear', () => {
    it('fetches the example pupil year', () => {
      const deductionYears = 8
      const exampleYear = pupilPresenter.getPupilExampleYear()
      expect(exampleYear).toBe(moment.utc().format('YYYY') - deductionYears)
    })
  })

  describe('getPupilsSortedWithIdentificationFlags', () => {
    it('sorts the pupils and adds identification flags', () => {
      const pupils = [
        { foreName: 'Tom', lastName: 'Smith', id: 1 },
        { foreName: 'Bob', lastName: 'Smith', id: 2 },
        { foreName: 'Sam', lastName: 'Grant', id: 3 }
      ]
      pupilPresenter.getPupilsSortedWithIdentificationFlags(pupils)
      expect(pupils[0].id).toEqual(3)
      expect(pupils[1].id).toEqual(2)
      expect(pupils[2].id).toEqual(1)
    })
  })
})

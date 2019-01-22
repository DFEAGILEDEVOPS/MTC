/* global describe, expect, it */
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
})

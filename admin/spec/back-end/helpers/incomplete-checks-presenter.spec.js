/* global describe, expect, test */

const incompleteChecksPresenter = require('../../../helpers/incomplete-checks-presenter')

describe('incompleteChecksPresenter', () => {
  describe('getPupilWithIncompleteChecks', () => {
    test('fetches pupils which status is incomplete', () => {
      const pupils = [{ urlSlug: 'urlSlug1', outcome: 'Not started' }, { urlSlug: 'urlSlug2', outcome: 'Incomplete' }]
      const result = incompleteChecksPresenter.getPupilWithIncompleteChecks(pupils)
      expect(result.length).toBe(1)
    })
  })
})

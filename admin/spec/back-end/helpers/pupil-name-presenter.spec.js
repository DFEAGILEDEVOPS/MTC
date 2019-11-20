/* global describe, expect, it */

const pupilNamePresenter = require('../../../helpers/pupil-name-presenter')

describe('pupilNamePresenter', () => {
  describe('createNamesForPupilView', () => {
    it('adds pupilViewForeName and pupilViewLastName based on alias fields when they are present', () => {
      const pupils = [
        {
          foreName: 'foreName',
          lastName: 'lastName',
          foreNameAlias: 'foreNameAlias',
          lastNameAlias: 'lastNameAlias'
        }
      ]
      const results = pupilNamePresenter.createNamesForPupilView(pupils)
      expect(results[0].pupilViewForeName).toBe(pupils[0].foreNameAlias)
      expect(results[0].pupilViewLastName).toBe(pupils[0].lastNameAlias)
    })
    it('adds pupilViewForeName and pupilViewLastName based on actual foreName and LastName fields when aliases are not present', () => {
      const pupils = [
        {
          foreName: 'foreName',
          lastName: 'lastName',
          foreNameAlias: undefined,
          lastNameAlias: undefined
        }
      ]
      const results = pupilNamePresenter.createNamesForPupilView(pupils)
      expect(results[0].pupilViewForeName).toBe(pupils[0].foreName)
      expect(results[0].pupilViewLastName).toBe(pupils[0].lastName)
    })
    it('returns additional fields that are part of the original object', () => {
      const pupils = [
        {
          foreName: 'foreName',
          lastName: 'lastName',
          foreNameAlias: 'foreNameAlias',
          lastNameAlias: 'lastNameAlias'
        }
      ]
      const results = pupilNamePresenter.createNamesForPupilView(pupils)
      expect(results[0].foreName).toBe(pupils[0].foreName)
      expect(results[0].lastName).toBe(pupils[0].lastName)
    })
  })
})

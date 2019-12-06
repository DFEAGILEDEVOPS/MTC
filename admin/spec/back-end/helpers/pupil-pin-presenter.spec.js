/* global describe, expect, it */

const pupilPinPresenter = require('../../../helpers/pupil-pin-presenter')

describe('pupilPinPresenter', () => {
  describe('getPupilPinViewData', () => {
    it('adds pupilViewForeName and pupilViewLastName based on alias fields when they are present', () => {
      const pupils = [
        {
          foreName: 'foreName',
          lastName: 'lastName',
          foreNameAlias: 'foreNameAlias',
          lastNameAlias: 'lastNameAlias'
        }
      ]
      const results = pupilPinPresenter.getPupilPinViewData(pupils)
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
      const results = pupilPinPresenter.getPupilPinViewData(pupils)
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
      const results = pupilPinPresenter.getPupilPinViewData(pupils)
      expect(results[0].foreName).toBe(pupils[0].foreName)
      expect(results[0].lastName).toBe(pupils[0].lastName)
    })
    it('returns sorted data in an ascending order alphabetically by group then by last name', () => {
      const pupils = [
        {
          foreName: 'foreName2',
          lastName: 'lastName2',
          group: null
        },
        {
          foreName: 'foreName1',
          lastName: 'lastName1',
          group: null
        },
        {
          foreName: 'foreName4',
          lastName: 'lastName4',
          group: 'beta'
        },
        {
          foreName: 'foreName3',
          lastName: 'lastName3',
          group: 'alpha'
        }
      ]
      const results = pupilPinPresenter.getPupilPinViewData(pupils)
      expect(results[0].group).toBe(pupils[3].group)
      expect(results[1].group).toBe(pupils[2].group)
      expect(results[2].group).toBe(pupils[1].group)
      expect(results[3].group).toBe(pupils[0].group)
    })
    it('returns sorted data alphabetically by last name if none of the pupils have groups assigned', () => {
      const pupils = [
        {
          foreName: 'foreName2',
          lastName: 'lastName2',
          group: null
        },
        {
          foreName: 'foreName1',
          lastName: 'lastName1',
          group: null
        },
        {
          foreName: 'foreName4',
          lastName: 'lastName4',
          group: null
        },
        {
          foreName: 'foreName3',
          lastName: 'lastName3',
          group: null
        }
      ]
      const results = pupilPinPresenter.getPupilPinViewData(pupils)
      expect(results[0].group).toBe(pupils[1].group)
      expect(results[1].group).toBe(pupils[0].group)
      expect(results[2].group).toBe(pupils[3].group)
      expect(results[3].group).toBe(pupils[2].group)
    })
  })
})

const accessArrangementsOverviewPresenter = require('../../../helpers/access-arrangements-overview-presenter')

describe('accessArrangementsOverviewPresenter', () => {
  describe('getPresentationData', () => {
    test('adds verticalBarStyle property if the pupil requires highlighting', () => {
      const pupils = [{ urlSlug: 'urlSlug1', arrangements: [] }, { urlSlug: 'urlSlug2', arrangements: [] }]
      const hl = ['urlSlug1']
      const formattedPupils = accessArrangementsOverviewPresenter.getPresentationData(pupils, {}, hl)
      expect(formattedPupils[0].verticalBarStyle).toBeDefined()
      expect(formattedPupils[1].verticalBarStyle).not.toBeDefined()
    })
    test('returns hasAAEditDisabled as true if user is not allowed to edit access arrangements for the particular pupil', () => {
      const pupils = [{ urlSlug: 'urlSlug1', arrangements: [], hasCompletedCheck: false, notTakingCheck: false }]
      const hl = []
      const availabilityData = { canEditArrangements: false }
      const formattedPupils = accessArrangementsOverviewPresenter.getPresentationData(pupils, availabilityData, hl)
      expect(formattedPupils[0].hasAAEditDisabled).toBeTruthy()
    })
    test('returns hasAAEditDisabled as true if the pupil has a completed check', () => {
      const pupils = [{ urlSlug: 'urlSlug1', arrangements: [], hasCompletedCheck: true, notTakingCheck: false }]
      const hl = []
      const availabilityData = { canEditArrangements: true }
      const formattedPupils = accessArrangementsOverviewPresenter.getPresentationData(pupils, availabilityData, hl)
      expect(formattedPupils[0].hasAAEditDisabled).toBeTruthy()
    })
    test('returns hasAAEditDisabled as true if the pupil cannot take the check', () => {
      const pupils = [{ urlSlug: 'urlSlug1', arrangements: [], hasCompletedCheck: false, notTakingCheck: true }]
      const hl = []
      const availabilityData = { canEditArrangements: true }
      const formattedPupils = accessArrangementsOverviewPresenter.getPresentationData(pupils, availabilityData, hl)
      expect(formattedPupils[0].hasAAEditDisabled).toBeTruthy()
    })
    test('returns hasAAEditDisabled as false if the user can edit access arrangements for a particular pupil, current check is incomplete and the pupil is taking the check', () => {
      const pupils = [{ urlSlug: 'urlSlug1', arrangements: [], hasCompletedCheck: false, notTakingCheck: false }]
      const hl = []
      const availabilityData = { canEditArrangements: true }
      const formattedPupils = accessArrangementsOverviewPresenter.getPresentationData(pupils, availabilityData, hl)
      expect(formattedPupils[0].hasAAEditDisabled).toBeFalsy()
    })
  })
})

const moment = require('moment')
const sut = require('../../../services/pupil-pin-presentation-service')
const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const config = require('../../../config')

describe('pupilPinPresentationService', () => {
  // CheckWindow and time of day testing.  For this test-suite to run we need to alter the date and time so we can
  // test the various check-window phases (familiarisation, official, post check) and at various times of the day to
  // simulate in-hours and out-of-hours.  To make this easier to understand we will keep the checkWindow constant,
  // based off the 2021 check window and mock the date time as required for each test.  At least this way one thing
  // is constant.
  const mockCheckWindow = {
    id: 1,
    name: 'Mock Check Window',
    adminStartDate: moment('2021-04-19T00:00:00'),
    adminEndDate: moment('2021-07-30T23:59:59'),
    checkStartDate: moment('2021-06-07T00:00:00'),
    checkEndDate: moment('2021-06-25T23:59:59'),
    familiarisationCheckStartDate: moment('2021-04-21T00:00:00'),
    familiarisationCheckEndDate: moment('2021-06-25T23:59:59'),
    isDeleted: false,
    urlSlug: '0000-0000-00000-00000'
  }

  let featureEligibilityData

  beforeEach(() => {
    // For the tests in the general section the check window dates are not important, as these values are
    // the same for all life-cycle phases of the check window.  We still need to mock it to prevent real calls.
    setupFakeTime(moment('2021-04-19T09:00:00'))

    // Make sure the config is not overridden for all tests
    config.OverridePinExpiry = false
    config.OverridePinValidFrom = false
  })

  afterEach(() => {
    jest.restoreAllMocks()
    tearDownFakeTime()
  })

  /**
   * @param {moment.Moment} baseTime - set the fake time to this moment object
   *
   */
  function setupFakeTime (baseTime) {
    if (!moment.isMoment(baseTime)) {
      throw new Error('moment.Moment time expected')
    }
    jest.useFakeTimers('modern')
    jest.setSystemTime(baseTime.toDate())
  }

  function tearDownFakeTime () {
    const realTime = jest.getRealSystemTime()
    jest.setSystemTime(realTime)
  }

  describe('PRE-FAMILIARISATION CHECK PHASE', () => {
    test('try it out pin gen is disabled when in hours', async () => {
      setupFakeTime(moment('2021-04-19T09:00:00')) // familiarisation doesn't open until 21st
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getTryItOutPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Open 6am - 4pm on 21 April 2021 to 25 June 2021/)
    })

    test('try it out pin gen is disabled out of hours with unavailable label and explanation', async () => {
      setupFakeTime(moment('2021-04-19T16:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getTryItOutPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Open 6am - 4pm/)
    })

    test('official check pin gen is disabled in hours', async () => {
      setupFakeTime(moment('2021-04-19T09:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getOfficialPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Open 6am - 4pm on 7 to 25 June 2021/)
      expect(data).toMatch(/Official check/)
    })

    test('official check pin gen is disabled out of hours', async () => {
      setupFakeTime(moment('2021-04-19T16:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getOfficialPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Open 6am - 4pm on 7 to 25 June 2021/)
      expect(data).toMatch(/Official check/)
    })
  })

  describe('FAMILIARISATION CHECK PHASE', () => {
    beforeEach(() => {
      setupFakeTime(moment('2021-04-21T09:00:00')) // Live doesn't open until 7th June
    })

    test('official check pin gen is disabled in hours', async () => {
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getOfficialPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Open 6am - 4pm on 7 to 25 June 2021/)
      expect(data).toMatch(/Official check/)
    })

    test('official check pin gen is disabled out of hours', async () => {
      setupFakeTime(moment('2021-04-21T16:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getOfficialPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Open 6am - 4pm on 7 to 25 June 2021/)
      expect(data).toMatch(/Official check/)
    })

    test('try it out pin gen is enabled when in hours', async () => {
      setupFakeTime(moment('2021-04-21T09:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getTryItOutPinGenSlot(featureEligibilityData)
      expect(data).toMatch(/href=/)
      expect(data).toMatch(/Try it out check/)
    })

    test('try it out pin gen is disabled out of hours with unavailable label and explanation', async () => {
      setupFakeTime(moment('2021-04-21T16:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getTryItOutPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Open 6am - 4pm/)
    })
  })

  describe('LIVE CHECK PHASE', () => {
    beforeEach(() => {
      setupFakeTime(moment('2021-06-07T09:00:00'))
    })

    test('try it out pin gen is enabled when in hours', async () => {
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getTryItOutPinGenSlot(featureEligibilityData)
      expect(data).toMatch(/href=/)
      expect(data).toMatch(/Try it out check/)
    })

    test('try it out pin gen is disabled out of hours with unavailable label and explanation', async () => {
      setupFakeTime(moment('2021-06-07T16:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getTryItOutPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Open 6am - 4pm/)
    })

    test('official check pin gen is enabled in hours', async () => {
      setupFakeTime(moment('2021-06-07T06:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getOfficialPinGenSlot(featureEligibilityData)
      expect(data).toMatch(/href=/)
      expect(data).toMatch(/Official check/)
    })

    test('official check pin gen is disabled out of hours', async () => {
      setupFakeTime(moment('2021-04-19T16:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getOfficialPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Open 6am - 4pm on 7 to 25 June 2021/)
      expect(data).toMatch(/Official check/)
    })
  })

  describe('AFTER LIVE CHECK WINDOW IS CLOSED', () => {
    test('try it out pin-gen link is disabled with unavailable label and explanation during normal hours', async () => {
      setupFakeTime(moment('2021-06-26T09:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getTryItOutPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Try it out check/)
      expect(data).toMatch(/Check window has closed/)
    })

    test('official check pin gen is disabled with label and explanation during normal hours', async () => {
      setupFakeTime(moment('2021-06-26T09:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getOfficialPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Official check/)
      expect(data).toMatch(/Check window has closed/)
    })

    test('try it out pin-gen link is disabled with unavailable label and explanation outside of normal hours', async () => {
      setupFakeTime(moment('2021-06-26T16:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getTryItOutPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Try it out check/)
      expect(data).toMatch(/Check window has closed/)
    })

    test('official check pin gen is disabled with label and explanation outside normal hours', async () => {
      setupFakeTime(moment('2021-06-26T16:00:00'))
      featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(mockCheckWindow, 'Europe/London')
      const data = await sut.getOfficialPinGenSlot(featureEligibilityData)
      expect(data).not.toMatch(/href=/)
      expect(data).toMatch(/UNAVAILABLE/)
      expect(data).toMatch(/Official check/)
      expect(data).toMatch(/Check window has closed/)
    })
  })
})

/* globals describe jest beforeEach expect test afterEach */
const sut = require('./school-home-page.service')
const moment = require('moment')
const checkWindowMocks = require('../../spec/back-end/mocks/check-window')
const administrationMessageService = require('../administration-message.service')
const checkWindowV2Service = require('../check-window-v2.service')
// const resultsPageAvailabilityService = require('../results-page-availability.service')
const schoolService = require('../school.service')
const config = require('../../config')

describe('school home page service', () => {
  const user = { timezone: 'Europe/London', role: 'TEACHER' }

  beforeEach(() => {
    jest.spyOn(schoolService, 'findSchoolNameByDfeNumber').mockResolvedValue('Unit Test School')
    jest.spyOn(administrationMessageService, 'getMessage').mockResolvedValue(undefined)
    // For the tests in the general section the check window dates are not important, as these values are
    // the same for all life-cycle phases of the check window.  We still need to mock it to prevent real calls.
    jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(checkWindowMocks.familiarisationCheckWindow)

    // Make sure the config is not override for all tests
    config.OverridePinExpiry = false
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('school name is returned', async () => {
    const data = await sut.getContent(user)
    expect(data.schoolName).toBe('Unit Test School')
  })

  test('feature eligibility data is returned', async () => {
    const data = await sut.getContent(user)
    expect(data.featureEligibilityData).toBeTruthy()
  })

  test('the service message is returned', async () => {
    jest.spyOn(administrationMessageService, 'getMessage').mockResolvedValue('test message')
    const data = await sut.getContent(user)
    expect(data.serviceMessage).toBe('test message')
  })

  describe('FAMILIARISATION CHECK PHASE', () => {
    beforeEach(() => {
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(checkWindowMocks.familiarisationCheckWindow)
    })

    test('group link is enabled ', async () => {
      const data = await sut.getContent(user)
      expect(data.groupsLinkSlot).toMatch(/href=/)
      expect(data.groupsLinkSlot).toMatch(/Organise pupils into groups/)
    })

    test('try it out pin gen is enabled when in hours', async () => {
      jest.spyOn(moment, 'utc').mockReturnValue(moment().hour(9))
      const data = await sut.getContent(user)
      expect(data.tryItOutPinGenSlot).toMatch(/href=/)
      expect(data.tryItOutPinGenSlot).toMatch(/Generate passwords and PINs for the try it out check/)
    })

    test('try it out pin gen is disabled out of hours with unavailable label and explanation', async () => {
      jest.spyOn(moment, 'utc').mockReturnValue(moment().hour(16))
      const data = await sut.getContent(user)
      expect(data.tryItOutPinGenSlot).not.toMatch(/href=/)
      expect(data.tryItOutPinGenSlot).toMatch(/UNAVAILABLE/)
      expect(data.tryItOutPinGenSlot).toMatch(/Open 6am - 4pm/)
    })
  })

  describe('LIVE CHECK PHASE', () => {
    beforeEach(() => {
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(checkWindowMocks.liveCheckWindow)
    })

    test('group link is enabled ', async () => {
      const data = await sut.getContent(user)
      expect(data.groupsLinkSlot).toMatch(/href=/)
      expect(data.groupsLinkSlot).toMatch(/Organise pupils into groups/)
    })

    test('try it out pin gen is enabled when in hours', async () => {
      jest.spyOn(moment, 'utc').mockReturnValue(moment().hour(9))
      const data = await sut.getContent(user)
      expect(data.tryItOutPinGenSlot).toMatch(/href=/)
      expect(data.tryItOutPinGenSlot).toMatch(/Generate passwords and PINs for the try it out check/)
    })

    test('try it out pin gen is disabled out of hours with unavailable label and explanation', async () => {
      jest.spyOn(moment, 'utc').mockReturnValue(moment().hour(16))
      const data = await sut.getContent(user)
      expect(data.tryItOutPinGenSlot).not.toMatch(/href=/)
      expect(data.tryItOutPinGenSlot).toMatch(/UNAVAILABLE/)
      expect(data.tryItOutPinGenSlot).toMatch(/Open 6am - 4pm/)
    })
  })

  describe('AFTER LIVE CHECK WINDOW IS CLOSED', () => {
    beforeEach(() => {
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(checkWindowMocks.postLiveCheckWindow)
    })

    test('group link is disabled with the unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.groupsLinkSlot).not.toMatch(/href=/)
      expect(data.groupsLinkSlot).toMatch(/UNAVAILABLE/)
      expect(data.groupsLinkSlot).toMatch(/Check window has closed/)
      expect(data.groupsLinkSlot).toMatch(/Organise pupils into groups/)
    })

    test('try it out pin-gen link is disabled with unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.tryItOutPinGenSlot).not.toMatch(/href=/)
      expect(data.tryItOutPinGenSlot).toMatch(/UNAVAILABLE/)
      expect(data.tryItOutPinGenSlot).toMatch(/Generate passwords and PINs for the try it out check/)
      expect(data.tryItOutPinGenSlot).toMatch(/Check window has closed/)
    })
  })
})

/* globals describe jest beforeEach expect test afterEach */
const sut = require('./school-home-page.service')
const moment = require('moment')
const administrationMessageService = require('../administration-message.service')
const checkWindowV2Service = require('../check-window-v2.service')
const schoolService = require('../school.service')
const config = require('../../config')

describe('school home page service', () => {
  const user = { timezone: 'Europe/London', role: 'TEACHER' }

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

  beforeEach(() => {
    jest.spyOn(schoolService, 'findSchoolNameByDfeNumber').mockResolvedValue('Unit Test School')
    jest.spyOn(administrationMessageService, 'getMessage').mockResolvedValue(undefined)
    // For the tests in the general section the check window dates are not important, as these values are
    // the same for all life-cycle phases of the check window.  We still need to mock it to prevent real calls.
    jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(mockCheckWindow)
    setupFakeTime(moment('2021-04-19T09:00:00'))

    // Make sure the config is not override for all tests
    config.OverridePinExpiry = false
  })

  afterEach(() => {
    jest.restoreAllMocks()
    tearDownFakeTime()
  })

  test('school name is returned', async () => {
    const data = await sut.getContent(user)
    expect(data.schoolName).toBe('Unit Test School')
  })

  describe('PRE-FAMILIARISATION CHECK PHASE', () => {
    beforeEach(() => {
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(mockCheckWindow)
      setupFakeTime(moment('2021-04-19T09:00:00'))
    })

    test('the pupil restart link is disabled with unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.restartPupilSlot).not.toMatch(/href=/)
      expect(data.restartPupilSlot).toMatch(/UNAVAILABLE/)
      expect(data.restartPupilSlot).toMatch(/Select pupils to restart the check/)
      expect(data.restartPupilSlot).toMatch(/Open 7 to 25 June 2021/)
    })

    test('the hdf link is disabled with unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.hdfSlot).not.toMatch(/href=/)
      expect(data.hdfSlot).toMatch(/UNAVAILABLE/)
      expect(data.hdfSlot).toMatch(/Complete the headteacher’s declaration form/)
      expect(data.hdfSlot).toMatch(/Open 7 June 2021/)
    })

    test('the pupil results link is disabled with unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.resultsSlot).not.toMatch(/href=/)
      expect(data.resultsSlot).toMatch(/UNAVAILABLE/)
      expect(data.resultsSlot).toMatch(/View pupil results/)
      expect(data.resultsSlot).toMatch(/Results available 28 June 2021/)
    })

    test('the pupil status link is disabled with unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.pupilStatusSlot).not.toMatch(/href=/)
      expect(data.pupilStatusSlot).toMatch(/UNAVAILABLE/)
      expect(data.pupilStatusSlot).toMatch(/See how many of your pupils have completed the official check/)
      expect(data.pupilStatusSlot).toMatch(/Open 7 to 25 June 2021/)
    })
  })

  describe('FAMILIARISATION CHECK PHASE', () => {
    beforeEach(() => {
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(mockCheckWindow)
      setupFakeTime(moment('2021-04-21T09:00:00'))
    })

    test('group link is enabled ', async () => {
      const data = await sut.getContent(user)
      expect(data.groupsLinkSlot).toMatch(/href=/)
      expect(data.groupsLinkSlot).toMatch(/Organise pupils into groups/)
    })

    test('the pupil restart link is disabled with unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.restartPupilSlot).not.toMatch(/href=/)
      expect(data.restartPupilSlot).toMatch(/UNAVAILABLE/)
      expect(data.restartPupilSlot).toMatch(/Select pupils to restart the check/)
      expect(data.restartPupilSlot).toMatch(/Open 7 to 25 June 2021/)
    })

    test('the hdf link is disabled with unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.hdfSlot).not.toMatch(/href=/)
      expect(data.hdfSlot).toMatch(/UNAVAILABLE/)
      expect(data.hdfSlot).toMatch(/Complete the headteacher’s declaration form/)
      expect(data.hdfSlot).toMatch(/Open 7 June 2021/)
    })

    test('the pupil results link is disabled with unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.resultsSlot).not.toMatch(/href=/)
      expect(data.resultsSlot).toMatch(/UNAVAILABLE/)
      expect(data.resultsSlot).toMatch(/View pupil results/)
      expect(data.resultsSlot).toMatch(/Results available 28 June 2021/)
    })

    test('the pupil status link is disabled with unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.pupilStatusSlot).not.toMatch(/href=/)
      expect(data.pupilStatusSlot).toMatch(/UNAVAILABLE/)
      expect(data.pupilStatusSlot).toMatch(/See how many of your pupils have completed the official check/)
      expect(data.pupilStatusSlot).toMatch(/Open 7 to 25 June 2021/)
    })
  })

  describe('LIVE CHECK PHASE', () => {
    beforeEach(() => {
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(mockCheckWindow)
      setupFakeTime(moment('2021-06-07T09:00:00'))
    })

    test('group link is enabled ', async () => {
      const data = await sut.getContent(user)
      expect(data.groupsLinkSlot).toMatch(/href=/)
      expect(data.groupsLinkSlot).toMatch(/Organise pupils into groups/)
    })

    test('the pupil restart link is enabled', async () => {
      const data = await sut.getContent(user)
      expect(data.restartPupilSlot).toMatch(/href=/)
      expect(data.restartPupilSlot).toMatch(/Select pupils to restart the check/)
    })

    test('the hdf link is enabled', async () => {
      const data = await sut.getContent(user)
      expect(data.hdfSlot).toMatch(/href=/)
      expect(data.hdfSlot).toMatch(/Complete the headteacher’s declaration form/)
    })

    test('the pupil results link is disabled with unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.resultsSlot).not.toMatch(/href=/)
      expect(data.resultsSlot).toMatch(/UNAVAILABLE/)
      expect(data.resultsSlot).toMatch(/View pupil results/)
      expect(data.resultsSlot).toMatch(/Results available 28 June 2021/)
    })

    test('the pupil status link is enabled', async () => {
      const data = await sut.getContent(user)
      expect(data.pupilStatusSlot).toMatch(/href=/)
      expect(data.pupilStatusSlot).toMatch(/See how many of your pupils have completed the official check/)
    })
  })

  describe('AFTER LIVE CHECK WINDOW IS CLOSED', () => {
    beforeEach(() => {
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(mockCheckWindow)
      setupFakeTime(moment('2021-06-26T00:00:01'))
    })

    test('group link is disabled with the unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.groupsLinkSlot).not.toMatch(/href=/)
      expect(data.groupsLinkSlot).toMatch(/UNAVAILABLE/)
      expect(data.groupsLinkSlot).toMatch(/Check window has closed/)
      expect(data.groupsLinkSlot).toMatch(/Organise pupils into groups/)
    })

    test('the pupil restart link is disabled with unavailable label and explanation', async () => {
      const data = await sut.getContent(user)
      expect(data.restartPupilSlot).not.toMatch(/href=/)
      expect(data.restartPupilSlot).toMatch(/UNAVAILABLE/)
      expect(data.restartPupilSlot).toMatch(/Select pupils to restart the check/)
      expect(data.restartPupilSlot).toMatch(/Check window has closed/)
    })

    test('the hdf link is disabled with unavailable label after the admin window ends', async () => {
      setupFakeTime(moment('2021-08-01T06:00:00'))
      const data = await sut.getContent(user)
      expect(data.hdfSlot).not.toMatch(/href=/)
      expect(data.hdfSlot).toMatch(/UNAVAILABLE/)
      expect(data.hdfSlot).toMatch(/Complete the headteacher’s declaration form/)
    })

    test('the pupil results link is disabled with unavailable label and explanation before the following monday at' +
      ' 6am', async () => {
      setupFakeTime(moment('2021-06-28T05:59:59+01:00')) // Just before 6am BST
      const data = await sut.getContent(user)
      expect(data.resultsSlot).not.toMatch(/href=/)
      expect(data.resultsSlot).toMatch(/UNAVAILABLE/)
      expect(data.resultsSlot).toMatch(/View pupil results/)
      expect(data.resultsSlot).toMatch(/Results available 28 June 2021/)
    })

    test('the pupil results link is enabled the following monday at 6am', async () => {
      setupFakeTime(moment('2021-06-28T06:00:00+01:00')) // 6am BST
      const data = await sut.getContent(user)
      expect(data.resultsSlot).toMatch(/href=/)
      expect(data.resultsSlot).toMatch(/View pupil results/)
    })

    test('the pupil status link is enabled', async () => {
      const data = await sut.getContent(user)
      expect(data.pupilStatusSlot).toMatch(/href=/)
      expect(data.pupilStatusSlot).toMatch(/See how many of your pupils have completed the official check/)
    })
  })
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

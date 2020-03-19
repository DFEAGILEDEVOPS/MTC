'use strict'
/* global $ jasmine describe it expect spyOn beforeEach afterEach */

describe('sessionExpiry', function () {
  describe('setCountdownText', function () {
    let fixture
    beforeEach(() => {
      fixture = $('<span class="session-expiration-countdown"></span>')
    })
    it('should use the singular form for 1 minute', function () {
      window.GOVUK.sessionExpiry.setCountdownText(fixture, 1)
      expect(fixture.text()).toBe('1 minute')
    })
    it('should use the plural form for > 1 minute', function () {
      window.GOVUK.sessionExpiry.setCountdownText(fixture, 2)
      expect(fixture.text()).toBe('2 minutes')
    })
  })

  describe('startTimer', function () {
    beforeEach(() => {
      window.SESSION_EXPIRATION_TIME = 20 * 60
      window.SESSION_DISPLAY_NOTICE_TIME = 15 * 60
      jasmine.clock().install()
    })
    afterEach(() => {
      jasmine.clock().uninstall()
    })
    it('should set the countdown text initially', function () {
      spyOn(window.GOVUK.sessionExpiry, 'setCountdownText')
      window.GOVUK.sessionExpiry.startTimer('fixture', 10)
      expect(window.GOVUK.sessionExpiry.setCountdownText).toHaveBeenCalledWith('fixture', 5)
    })
    it('should decrease the minute count and set the text after tickMs', function () {
      spyOn(window.GOVUK.sessionExpiry, 'setCountdownText')
      window.GOVUK.sessionExpiry.startTimer('fixture', 10)
      jasmine.clock().tick(11)
      expect(window.GOVUK.sessionExpiry.setCountdownText).toHaveBeenCalledWith('fixture', 4)
    })
    it('should display the expired banner on 0 minutes left', function () {
      spyOn(window.GOVUK.sessionExpiry, 'setCountdownText')
      spyOn(window.GOVUK.sessionExpiry, 'displayExpiredBanner')
      window.GOVUK.sessionExpiry.startTimer('fixture', 10)
      jasmine.clock().tick(10 * 5 + 1)
      expect(window.GOVUK.sessionExpiry.displayExpiredBanner).toHaveBeenCalled()
    })
  })

  describe('displayExpiryBanner', function () {
    let fixtureContainer
    let fixtureMinutesCountdown
    let fixtureButton
    beforeEach(() => {
      fixtureContainer = $('<div class="error-session-expiration error-summary"></div>)')
      fixtureMinutesCountdown = $('<span class="session-expiration-countdown"></span>')
      fixtureButton = $('<button id="continue-session-expiration"></button>')
    })
    it('should make the container visible by changing classes', function () {
      window.GOVUK.sessionExpiry.displayExpiryBanner(fixtureContainer, fixtureMinutesCountdown, fixtureButton)
      expect(fixtureContainer.hasClass('error-session-expiration')).toBe(false)
      expect(fixtureContainer.hasClass('error-about-to-expire-session')).toBe(true)
    })
    it('should add a reload click handler on the continue button', function () {
      spyOn(window.GOVUK.sessionExpiry, 'hideExpiryBanner')
      window.GOVUK.sessionExpiry.displayExpiryBanner(fixtureContainer, fixtureMinutesCountdown, fixtureButton)
      fixtureButton.click()
      expect(window.GOVUK.sessionExpiry.hideExpiryBanner).toHaveBeenCalled()
    })
    it('should start the timer with a minute interval', function () {
      spyOn(window.GOVUK.sessionExpiry, 'startTimer')
      window.GOVUK.sessionExpiry.displayExpiryBanner(fixtureContainer, fixtureMinutesCountdown, fixtureButton)
      expect(window.GOVUK.sessionExpiry.startTimer).toHaveBeenCalledWith(fixtureMinutesCountdown, 60 * 1000)
    })
  })

  describe('hideExpiryBanner', function () {
    let fixtureContainer
    beforeEach(() => {
      fixtureContainer = $('<div class="error-session-expiration error-summary"></div>)')
    })
    it('should make the container hidden by changing classes', function () {
      window.GOVUK.sessionExpiry.hideExpiryBanner(fixtureContainer)
      expect(fixtureContainer.hasClass('error-session-expiration')).toBe(true)
      expect(fixtureContainer.hasClass('error-about-to-expire-session')).toBe(false)
    })
  })

  describe('displayExpiredBanner', function () {
    let fixtureContainer
    let fixtureContainerBody
    beforeEach(() => {
      fixtureContainer = $('<div class="error-session-expiration error-summary"></div>)')
      fixtureContainerBody = $('<div id="error-session-expiration-body" class="govuk-error-summary__body"></div>')
    })
    it('should make the container hidden by changing classes', function () {
      window.GOVUK.sessionExpiry.displayExpiredBanner(fixtureContainer, fixtureContainerBody)
      expect(fixtureContainer.hasClass('error-session-expiration')).toBe(false)
      expect(fixtureContainer.hasClass('error-about-to-expire-session')).toBe(true)
    })
    it('should modify the content to inform the user that session is expired', function () {
      window.GOVUK.sessionExpiry.displayExpiredBanner(fixtureContainer, fixtureContainerBody)
      expect(fixtureContainerBody.innerHTML).toBe(`
      <p>You have been logged out of the MTC service. Please <a href="/sign-in">sign in</a></p>
      `)
    })
  })
})

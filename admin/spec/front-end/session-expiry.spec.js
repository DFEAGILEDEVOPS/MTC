'use strict'
/* global $ jasmine describe it expect spyOn beforeEach afterEach */

describe('sessionExpiry', function () {
  describe('setCountdownText', function () {
    let fixture
    beforeEach(() => {
      fixture = $('<span class="session-expiration-countdown"></span>')
    })
    it('should use the singular form for 1 minute', function (done) {
      $(() => {
        window.GOVUK.sessionExpiry.setCountdownText(fixture, 1)
        expect(fixture.text()).toBe('1 minute')
        done()
      })
    })
    it('should use the plural form for > 1 minute', function (done) {
      $(() => {
        window.GOVUK.sessionExpiry.setCountdownText(fixture, 2)
        expect(fixture.text()).toBe('2 minutes')
        done()
      })
    })
  })

  describe('startTimer', function () {
    beforeEach(() => {
      window.SESSION_DISPLAY_NOTICE_TIME = 15 * 60
      jasmine.clock().install()
    })

    afterEach(() => {
      jasmine.clock().uninstall()
    })

    it('should set the countdown text initially', function () {
      spyOn(window.GOVUK.sessionExpiry, 'setCountdownText')
      const expiryDate = Date.now() + 300000
      window.GOVUK.sessionExpiry.startTimer('fixture', 10, expiryDate)
      expect(window.GOVUK.sessionExpiry.setCountdownText).toHaveBeenCalledWith('fixture', 5)
    })

    it('should decrease the minute count and set the text after tickMs', function () {
      const expiryDate = Date.now() + 300000
      spyOn(window.GOVUK.sessionExpiry, 'setCountdownText')
      window.GOVUK.sessionExpiry.startTimer('fixture', 60 * 1000, expiryDate)
      jasmine.clock().tick(60001)
      expect(window.GOVUK.sessionExpiry.setCountdownText).toHaveBeenCalledWith('fixture', 4)
    })

    it('should display the expired banner on 0 minutes left', function (done) {
      const expiryDate = Date.now()
      let finished = false
      spyOn(window.GOVUK.sessionExpiry, 'setCountdownText')
      spyOn(window.GOVUK.sessionExpiry, 'displayExpiredBanner').and.callFake(function () {
        expect(window.GOVUK.sessionExpiry.displayExpiredBanner).toHaveBeenCalled()
        if (!finished) { done() }
        finished = true
      })
      window.GOVUK.sessionExpiry.startTimer('fixture', 10, expiryDate)
      jasmine.clock().tick((10 * 5) + 1)
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
    it('should make the container visible by changing classes', function (done) {
      $(function () {
        window.GOVUK.sessionExpiry.displayExpiryBanner(fixtureContainer, fixtureMinutesCountdown, fixtureButton)
        expect(fixtureContainer.hasClass('error-session-expiration')).toBe(false)
        expect(fixtureContainer.hasClass('error-about-to-expire-session')).toBe(true)
        done()
      })
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

  describe('keepAlive', function () {
    const sessionExtendedResponse = { success: true, sessionExpiresAt: Date.now() + 2000 }
    const sessionExtendFailureResponse = { success: false }

    it('it makes a call to the server to keep the session alive', (done) => {
      spyOn($, 'ajax').and.callFake(function () {
        return $.Deferred().resolve(sessionExtendedResponse, 201).promise()
      })
      spyOn(window.GOVUK.sessionExpiry, 'resetSessionExpiryModal')
      window.GOVUK.sessionExpiry.keepAlive()
      expect($.ajax).toHaveBeenCalledWith('/keep-alive')
      done()
    })

    it('if the session is extended it calls a function to extend the countdown', (done) => {
      spyOn($, 'ajax').and.callFake(function () {
        return $.Deferred().resolve(sessionExtendedResponse, 201).promise()
      })
      spyOn(window.GOVUK.sessionExpiry, 'resetSessionExpiryModal').and.callFake(function () {
        expect(window.GOVUK.sessionExpiry.resetSessionExpiryModal).toHaveBeenCalled()
        done()
      })
      window.GOVUK.sessionExpiry.keepAlive()
    })

    it('redirects to sign-out if the session cannot be extended', (done) => {
      spyOn($, 'ajax').and.callFake(function () {
        return $.Deferred().reject(sessionExtendFailureResponse, 403).promise()
      })
      spyOn(window.GOVUK.sessionExpiry, 'redirectPage').and.callFake(function () {
        expect(window.GOVUK.sessionExpiry.redirectPage).toHaveBeenCalledWith('/sign-out')
        done()
      })
      window.GOVUK.sessionExpiry.keepAlive()
    })
  })

  describe('resetSessionExpiryModal', function () {
    describe('mocked', function () {
      beforeEach(function () {
        spyOn(window, 'setTimeout')
        spyOn(window, 'clearInterval')
        spyOn(window.GOVUK.sessionExpiry, 'startTimer')
      })

      it('sets the timeout for displaying the next modal popup to 5 minutes', function () {
        const newExpiry = Date.now() + 50000
        window.GOVUK.sessionExpiry.resetSessionExpiryModal(newExpiry)
        expect(window.setTimeout).toHaveBeenCalled()
      })

      it('clears the any existing countDown interval Id', function () {
        const newExpiry = Date.now() + 20
        window.GOVUK.sessionExpiry.countDownIntervalId = 9
        window.GOVUK.sessionExpiry.resetSessionExpiryModal(newExpiry)
        expect(window.clearInterval).toHaveBeenCalledWith(9)
      })

      it('calls startTimer to show the logged-out message to the screen at the end of the current session', () => {
        const newExpiry = Date.now() + 20
        window.GOVUK.sessionExpiry.resetSessionExpiryModal(newExpiry)
        expect(window.GOVUK.sessionExpiry.startTimer).toHaveBeenCalled()
      })
    })
  })
})

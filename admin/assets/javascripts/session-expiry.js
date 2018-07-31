/**
 * Logic for handling the session expiration banner
 */
/* global $, SESSION_DISPLAY_NOTICE_TIME, SESSION_EXPIRATION_TIME */
$(function () {
  'use strict'
  if (!window.GOVUK) {
    window.GOVUK = {}
  }
  window.GOVUK.sessionExpiry = {
    /**
     * Helper to logout the user by redirecting to the sign-out page
     */
    redirectToLogout: function () {
      window.location.href = '/sign-out'
    },
    /**
     * Helper to call window reload
     */
    reloadPage: function () {
      window.location.reload()
    },
    /**
     * Set the formatted text on minutesCountdown to the count of `minutes`
     */
    setCountdownText: function (minutesCountdown, minutes) {
      var formattedText = minutes === 1 ? '1 minute' : minutes + ' minutes'
      minutesCountdown.text(formattedText)
    },
    /**
     * Start a setInterval to update the countdown every `tickMs`
     */
    startTimer: function (minutesCountdown, tickMs) {
      var remainingMinutes = Math.ceil((SESSION_EXPIRATION_TIME - SESSION_DISPLAY_NOTICE_TIME) / 60)
      window.GOVUK.sessionExpiry.setCountdownText(minutesCountdown, remainingMinutes)
      window.setInterval(function () {
        window.GOVUK.sessionExpiry.setCountdownText(minutesCountdown, --remainingMinutes)
        if (remainingMinutes === 0) window.GOVUK.sessionExpiry.redirectToLogout()
      }, tickMs)
    },
    /**
     * Unhide the expiration banner, register the button click handler and start the countdown
     */
    displayExpiryBanner: function (sessionExpirationError, minutesCountdown, continueSessionButton) {
      sessionExpirationError.removeClass('error-session-expiration')
      sessionExpirationError.addClass('error-about-to-expire-session')

      continueSessionButton.click(function (e) {
        e.preventDefault()
        window.GOVUK.sessionExpiry.reloadPage()
      })

      window.GOVUK.sessionExpiry.startTimer(minutesCountdown, 60 * 1000)
    }
  }

  var sessionExpirationError = $('.error-session-expiration')
  var minutesCountdown = $('.session-expiration-countdown')
  var continueSessionButton = $('#continue-session-expiration')
  if (sessionExpirationError.length > 0) {
    window.setTimeout(function () {
      window.GOVUK.sessionExpiry.displayExpiryBanner(sessionExpirationError, minutesCountdown, continueSessionButton)
    }, SESSION_DISPLAY_NOTICE_TIME * 1000)
    // defensive programming, always redirect
    window.setTimeout(window.GOVUK.sessionExpiry.redirectToLogout, SESSION_EXPIRATION_TIME * 1000)
  }
})

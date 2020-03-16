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
        const remainingSeconds = remainingMinutes * 60
        if (remainingSeconds <= 5) {
          const sessionExpirationErrorBody = document.getElementById('error-session-expiration-body')
          window.GOVUK.sessionExpiry.displayExpiredBanner(sessionExpirationError, sessionExpirationErrorBody, sessionExpirationErrorBody)
        }
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
        window.GOVUK.sessionExpiry.hideExpiryBanner(sessionExpirationError)
      })

      window.GOVUK.sessionExpiry.startTimer(minutesCountdown, 60 * 1000)
    },

    /**
     * Hide the expiration banner
     */
    hideExpiryBanner: function (sessionExpirationError) {
      sessionExpirationError.removeClass('error-about-to-expire-session')
      sessionExpirationError.addClass('error-session-expiration')
    },

    /**
     * Display the banner with the expired content
     */
    displayExpiredBanner: function (sessionExpirationError, sessionExpirationErrorBody) {
      // Replace the content of the session expiration body
      sessionExpirationErrorBody.innerHTML = `
      <p>You have been logged out of the MTC service. Please <a href="/sign-in">sign in</a></p>
      `
      sessionExpirationError.removeClass('error-session-expiration')
      sessionExpirationError.addClass('error-about-to-expire-session')
    }
  }

  var sessionExpirationError = $('.error-session-expiration')
  var minutesCountdown = $('.session-expiration-countdown')
  var continueSessionButton = $('#continue-session-expiration')
  if (sessionExpirationError.length > 0) {
    window.setTimeout(function () {
      window.GOVUK.sessionExpiry.displayExpiryBanner(sessionExpirationError, minutesCountdown, continueSessionButton)
    }, SESSION_DISPLAY_NOTICE_TIME * 1000)
  }
})

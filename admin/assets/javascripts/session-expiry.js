/**
 * Logic for handling the session expiration banner
 */
/* global SESSION_DISPLAY_NOTICE_TIME */
$(function () {
  'use strict'
  if (!window.GOVUK) {
    window.GOVUK = {}
  }
  window.GOVUK.sessionExpiry = {
    /**
     * Store the session expiry countdown interval, so we can cancel it if the user clicks 'continue'
     */
    countDownIntervalId: null,
    /**
     * Set the formatted text on minutesCountdown to the count of `minutes`
     * @param {jQuery} minutesCountdown
     * @param {number} minutes
     *
     */
    setCountdownText: function (minutesCountdown, minutes) {
      var formattedText = minutes === 1 ? '1 minute' : minutes + ' minutes'
      minutesCountdown.text(formattedText)
    },
    /**
     * Start a setInterval to update the countdown every `tickMs`
     * @param {jQuery} minutesCountdown
     * @param {number} tickMs
     * @param {date} expiryDate - the Date that the session expires
     */
    startTimer: function (minutesCountdown, tickMs, expiryDate) {
      var now = Date.now()
      var remainingMinutes = Math.ceil(((expiryDate.valueOf() - now.valueOf()) / 1000) / 60)
      window.GOVUK.sessionExpiry.setCountdownText(minutesCountdown, remainingMinutes)

      window.GOVUK.sessionExpiry.countDownIntervalId = window.setInterval(function () {
        var d = Date.now()
        window.GOVUK.sessionExpiry.setCountdownText(minutesCountdown, --remainingMinutes)
        const remainingSeconds = (expiryDate.valueOf() - d.valueOf()) / 1000
        if (remainingSeconds <= 5) {
          const sessionExpirationErrorBody = document.getElementById('error-session-expiration-body')
          window.GOVUK.sessionExpiry.displayExpiredBanner(sessionExpirationError, sessionExpirationErrorBody, sessionExpirationErrorBody)
        }
      }, tickMs)
    },
    /**
     * Unhide the expiration banner, register the button click handler and start the countdown
     * @param {jQuery} sessionExpirationError
     * @param {jQuery} minutesCountdown
     * @param {jQuery} continueSessionButton
     */
    displayExpiryBanner: function (sessionExpirationError) {
      sessionExpirationError.removeClass('error-session-expiration')
      sessionExpirationError.addClass('error-about-to-expire-session')
    },

    /**
     * Hide the expiration banner
     * @param {jQuery} sessionExpirationError
     */
    hideExpiryBanner: function (sessionExpirationError) {
      sessionExpirationError.removeClass('error-about-to-expire-session')
      sessionExpirationError.addClass('error-session-expiration')
    },

    /**
     * Display the banner with the expired content
     * @param {jQuery} sessionExpirationError
     * @param {jQuery} sessionExpirationErrorBody
     */
    displayExpiredBanner: function (sessionExpirationError, sessionExpirationErrorBody) {
      // Replace the content of the session expiration body
      sessionExpirationErrorBody.innerHTML = `
      <p>You have been logged out of the MTC service. Please <a href="/sign-in">sign in</a></p>
      `
      sessionExpirationError.removeClass('error-session-expiration')
      sessionExpirationError.addClass('error-about-to-expire-session')
    },

    redirectPage: function (url) {
      // Wrapper method as we cannot spy on window.location directly
      window.location.replace(url)
    },

    /**
     * Keep a session alive by pinging the server
     */
    keepAlive: function () {
      $.ajax('/keep-alive')
        .then(function (res) {
          if (res.success) {
            const newSessionExpiresAt = new Date(res.sessionExpiresAt)
            window.GOVUK.sessionExpiry.resetSessionExpiryModal(newSessionExpiresAt)
          } else {
            window.GOVUK.sessionExpiry.redirectPage('/sign-out')
          }
        })
        .catch(() => {
          window.GOVUK.sessionExpiry.redirectPage('/sign-out')
        })
    },

    resetSessionExpiryModal: function resetSessionExpiryModal (expiryDate) {
      window.setTimeout(function () {
        window.GOVUK.sessionExpiry.displayExpiryBanner(sessionExpirationError, minutesCountdown, continueSessionButton)
      }, SESSION_DISPLAY_NOTICE_TIME * 1000)

      if (window.GOVUK.sessionExpiry.countDownIntervalId !== null) {
        window.clearInterval(window.GOVUK.sessionExpiry.countDownIntervalId)
      }

      window.GOVUK.sessionExpiry.startTimer(minutesCountdown, 60 * 1000, expiryDate)
    }
  }

  var sessionExpirationError = $('.error-session-expiration')
  var minutesCountdown = $('.session-expiration-countdown')
  var continueSessionButton = $('#continue-session-expiration')
  var sessionExpiresAt = $('body').data('session-expires-at')
  // Clear the data attribute after reading, before it gets out-of-date
  $('body').removeAttr('data-session-expires-at')

  var sessionExpiresAtDate = null
  if (sessionExpiresAt) {
    sessionExpiresAtDate = new Date(sessionExpiresAt)
  }

  if (sessionExpirationError.length > 0 && sessionExpiresAtDate !== null) {
    window.GOVUK.sessionExpiry.resetSessionExpiryModal(sessionExpiresAtDate)
    continueSessionButton.click(function (e) {
      e.preventDefault()
      window.GOVUK.sessionExpiry.hideExpiryBanner(sessionExpirationError)
      window.GOVUK.sessionExpiry.keepAlive()
    })
  }
  sessionExpiresAt = null
  sessionExpiresAtDate = null
})

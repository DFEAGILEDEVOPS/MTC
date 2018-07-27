/**
 * Logic for handling the session expiration banner
 */
/* global $, SESSION_DISPLAY_NOTICE_TIME, SESSION_EXPIRATION_TIME */
$(function () {
  'use strict'
  var redirectToLogout = function () {
    window.location.href = '/sign-out'
  }
  var setCountdownText = function (minutes) {
    var formattedText = minutes === 1 ? '1 minute' : minutes + ' minutes'
    $('.session-expiration-countdown').text(formattedText)
  }
  var displayExpiryBanner = function () {
    sessionExpirationError.removeClass('error-session-expiration')
    sessionExpirationError.addClass('error-about-to-expire-session')

    $('#continue-session-expiration').click(function (e) {
      e.preventDefault()
      window.location.reload()
    })

    var remainingMinutes = Math.ceil((SESSION_EXPIRATION_TIME - SESSION_DISPLAY_NOTICE_TIME) / 60)
    setCountdownText(remainingMinutes)
    window.setInterval(function () {
      setCountdownText(--remainingMinutes)
      if (remainingMinutes === 0) redirectToLogout()
    }, 60 * 1000)
  }

  var sessionExpirationError = $('.error-session-expiration')
  if (sessionExpirationError.length > 0) {
    window.setTimeout(displayExpiryBanner, SESSION_DISPLAY_NOTICE_TIME * 1000)
    window.setTimeout(redirectToLogout, SESSION_EXPIRATION_TIME * 1000) // defensive programming, always redirect
  }
})

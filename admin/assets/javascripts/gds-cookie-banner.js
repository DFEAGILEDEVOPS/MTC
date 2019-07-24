
'use strict'
if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

window.MTCAdmin.CookieBanner = {
  init: function (name, value, options) {
    if (typeof value !== 'undefined') {
      if (value === false || value === null) {
        return window.MTCAdmin.CookieBanner.setCookie(name, '', { days: -1 })
      } else {
        return window.MTCAdmin.CookieBanner.setCookie(name, value, options)
      }
    } else {
      return window.MTCAdmin.CookieBanner.getCookie(name)
    }
  },
  setCookie: function (name, value, options) {
    if (typeof options === 'undefined') {
      options = {}
    }
    var cookieString = name + '=' + value + '; path=/'
    if (options.days) {
      var date = new Date()
      date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000))
      cookieString = cookieString + '; expires=' + date.toGMTString()
    }
    if (document.location.protocol === 'https:') {
      cookieString = cookieString + ' Secure'
    }
    document.cookie = cookieString
  },
  getCookie: function (name) {
    var nameEQ = name + '='
    var cookies = document.cookie.split(';')
    for (var i = 0, len = cookies.length; i < len; i++) {
      var cookie = cookies[i]
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length)
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length))
      }
    }
    return null
  },
  addCookieMessage: function () {
    var message = document.querySelector('.js-cookie-banner')
    var hasCookieMessage = (message && window.MTCAdmin.CookieBanner.init('seen_cookie_message') === null)
    if (hasCookieMessage) {
      message.style.display = 'block'
      window.MTCAdmin.CookieBanner.init('seen_cookie_message', 'yes', { days: 28 })
    }
  }
}

var closeCookieMessage = document.getElementById('close-cookie-message')

if (closeCookieMessage) {
  closeCookieMessage.addEventListener('click', function (e) {
    e.preventDefault()
    var message = document.getElementById('global-cookie-message')
    if (message) {
      message.style.display = 'none'
    }
  })
}

// Add cookie message
window.MTCAdmin.CookieBanner.addCookieMessage()

// https://github.com/alphagov/govuk_publishing_components/blob/master/app/assets/javascripts/govuk_publishing_components/lib/cookie-functions.js
// used by the cookie banner component

(function () {
  'use strict'
  window.GOVUK = window.GOVUK || {}

  const DEFAULT_COOKIE_CONSENT = {
    essential: true,
    settings: false,
    usage: false,
    campaigns: false
  }

  const COOKIE_CATEGORIES = {
    cookies_policy: 'essential',
    seen_cookie_message: 'essential',
    cookie_preferences_set: 'essential',
    cookies_preferences_set: 'essential',
    '_email-alert-frontend_session': 'essential',
    licensing_session: 'essential',
    govuk_contact_referrer: 'essential',
    dgu_beta_banner_dismissed: 'settings',
    global_bar_seen: 'settings',
    govuk_browser_upgrade_dismisssed: 'settings',
    govuk_not_first_visit: 'settings',
    analytics_next_page_call: 'usage',
    _ga: 'usage',
    _gid: 'usage',
    _gat: 'usage',
    'JS-Detection': 'usage',
    TLSversion: 'usage'
  }

  /*
    Cookie methods
    ==============

    Usage:

      Setting a cookie:
      GOVUK.cookie('hobnob', 'tasty', { days: 30 });

      Reading a cookie:
      GOVUK.cookie('hobnob');

      Deleting a cookie:
      GOVUK.cookie('hobnob', null);
  */
  window.GOVUK.cookie = function (name, value, options) {
    if (typeof value !== 'undefined') {
      if (value === false || value === null) {
        return window.GOVUK.setCookie(name, '', { days: -1 })
      } else {
        // Default expiry date of 30 days
        if (typeof options === 'undefined') {
          options = { days: 30 }
        }
        return window.GOVUK.setCookie(name, value, options)
      }
    } else {
      return window.GOVUK.getCookie(name)
    }
  }

  window.GOVUK.setDefaultConsentCookie = function () {
    window.GOVUK.setConsentCookie(DEFAULT_COOKIE_CONSENT)
  }

  window.GOVUK.approveAllCookieTypes = function () {
    const approvedConsent = {
      essential: true,
      settings: true,
      usage: true,
      campaigns: true
    }

    window.GOVUK.setCookie('cookies_policy', JSON.stringify(approvedConsent), { days: 365 })
  }

  window.GOVUK.getConsentCookie = function () {
    const consentCookie = window.GOVUK.cookie('cookies_policy')
    let consentCookieObj

    if (consentCookie) {
      try {
        consentCookieObj = JSON.parse(consentCookie)
      } catch {
        return null
      }

      if (typeof consentCookieObj !== 'object' && consentCookieObj !== null) {
        consentCookieObj = JSON.parse(consentCookieObj)
      }
    } else {
      return null
    }

    return consentCookieObj
  }

  window.GOVUK.setConsentCookie = function (options) {
    let cookieConsent = window.GOVUK.getConsentCookie()

    if (!cookieConsent) {
      cookieConsent = JSON.parse(JSON.stringify(DEFAULT_COOKIE_CONSENT))
    }

    for (const cookieType in options) {
      cookieConsent[cookieType] = options[cookieType]

      // Delete cookies of that type if consent being set to false
      if (!options[cookieType]) {
        for (const cookie in COOKIE_CATEGORIES) {
          if (COOKIE_CATEGORIES[cookie] === cookieType) {
            window.GOVUK.deleteCookie(cookie)
          }
        }
      }
    }

    window.GOVUK.setCookie('cookies_policy', JSON.stringify(cookieConsent), { days: 365 })
  }

  window.GOVUK.checkConsentCookieCategory = function (cookieName, cookieCategory) {
    let currentConsentCookie = window.GOVUK.getConsentCookie()

    // If the consent cookie doesn't exist, but the cookie is in our known list, return true
    if (!currentConsentCookie && COOKIE_CATEGORIES[cookieName]) {
      return true
    }

    currentConsentCookie = window.GOVUK.getConsentCookie()

    // Sometimes currentConsentCookie is malformed in some of the tests, so we need to handle these
    try {
      return currentConsentCookie[cookieCategory]
    } catch (e) {
      console.error(e)
      return false
    }
  }

  window.GOVUK.checkConsentCookie = function (cookieName, cookieValue) {
    // If we're setting the consent cookie OR deleting a cookie, allow by default
    if (cookieName === 'cookies_policy' || (cookieValue === null || cookieValue === false)) {
      return true
    }

    // Survey cookies are dynamically generated, so we need to check for these separately
    if (cookieName.match('^govuk_surveySeen') || cookieName.match('^govuk_taken')) {
      return window.GOVUK.checkConsentCookieCategory(cookieName, 'settings')
    }

    if (COOKIE_CATEGORIES[cookieName]) {
      const cookieCategory = COOKIE_CATEGORIES[cookieName]

      return window.GOVUK.checkConsentCookieCategory(cookieName, cookieCategory)
    } else {
      // Deny the cookie if it is not known to us
      return false
    }
  }

  window.GOVUK.setCookie = function (name, value, options) {
    if (window.GOVUK.checkConsentCookie(name, value)) {
      if (typeof options === 'undefined') {
        options = {}
      }
      let cookieString = name + '=' + value + '; path=/'
      if (options.days) {
        const date = new Date()
        date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000))
        cookieString = cookieString + '; expires=' + date.toGMTString()
      }
      if (document.location.protocol === 'https:') {
        cookieString = cookieString + '; Secure'
      }
      document.cookie = cookieString
    }
  }

  window.GOVUK.getCookie = function (name) {
    const nameEQ = name + '='
    const cookies = document.cookie.split(';')
    for (let i = 0, len = cookies.length; i < len; i++) {
      let cookie = cookies[i]
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length)
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length))
      }
    }
    return null
  }

  window.GOVUK.getCookieCategory = function (cookie) {
    return COOKIE_CATEGORIES[cookie]
  }

  window.GOVUK.deleteCookie = function (cookie) {
    window.GOVUK.cookie(cookie, null)

    if (window.GOVUK.cookie(cookie)) {
      // We need to handle deleting cookies on the domain and the .domain
      document.cookie = cookie + '=;expires=' + new Date() + ';'
      document.cookie = cookie + '=;expires=' + new Date() + ';domain=' + window.location.hostname + ';path=/'
    }
  }

  window.GOVUK.deleteUnconsentedCookies = function () {
    const currentConsent = window.GOVUK.getConsentCookie()

    for (const cookieType in currentConsent) {
      // Delete cookies of that type if consent being set to false
      if (!currentConsent[cookieType]) {
        for (const cookie in COOKIE_CATEGORIES) {
          if (COOKIE_CATEGORIES[cookie] === cookieType) {
            window.GOVUK.deleteCookie(cookie)
          }
        }
      }
    }
  }
}(window))

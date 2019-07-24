'use strict'
/* global describe it expect beforeEach spyOn */

function initGdsCookieBannerElements () {
  const htmlElements = `
    <div class="app-cookie-banner js-cookie-banner" id="global-cookie-message" style="display:none">
    <p class="govuk-width-container">
      The Multiplication tables check service uses cookies to make the site simpler.
      <a href="/cookies" class="govuk-link">Find out more about cookies</a> or <a id="close-cookie-message" href="#">hide this message</a>
    </p>
    </div>
  `
  document.body.innerHTML = htmlElements
}

describe('gds-cookie-banner', function () {
  describe('addCookieMessage', function () {
    beforeEach(() => {
      document.body.innerHTML = ''
      initGdsCookieBannerElements()
    })
    it('should display the message when init method returns null', function () {
      spyOn(window.MTCAdmin.CookieBanner, 'init').and.returnValue(null)
      window.MTCAdmin.CookieBanner.addCookieMessage()
      expect(document.querySelector('.js-cookie-banner').style.display).toBe('block')
    })
    it('should not display the message when init method returns a value other than null', function () {
      spyOn(window.MTCAdmin.CookieBanner, 'init').and.returnValue('value')
      window.MTCAdmin.CookieBanner.addCookieMessage()
      expect(document.querySelector('.js-cookie-banner').style.display).toBe('none')
    })
  })
  describe('init', function () {
    beforeEach(() => {
      spyOn(window.MTCAdmin.CookieBanner, 'getCookie')
      spyOn(window.MTCAdmin.CookieBanner, 'setCookie')
    })
    it('should call getCookie method when second parameter passed is undefined', function () {
      window.MTCAdmin.CookieBanner.init('seen_cookie_message')
      expect(window.MTCAdmin.CookieBanner.getCookie).toHaveBeenCalled()
      expect(window.MTCAdmin.CookieBanner.setCookie).not.toHaveBeenCalled()
    })
    it('should call setCookie method when second parameter is false or null', function () {
      window.MTCAdmin.CookieBanner.init('seen_cookie_message', false)
      expect(window.MTCAdmin.CookieBanner.getCookie).not.toHaveBeenCalled()
      expect(window.MTCAdmin.CookieBanner.setCookie).toHaveBeenCalledWith('seen_cookie_message', '', { days: -1 })
    })
    it('should call setCookie method when name, value and options are provided as arguments', function () {
      window.MTCAdmin.CookieBanner.init('seen_cookie_message', 'yes', { days: 28 })
      expect(window.MTCAdmin.CookieBanner.getCookie).not.toHaveBeenCalled()
      expect(window.MTCAdmin.CookieBanner.setCookie).toHaveBeenCalledWith('seen_cookie_message', 'yes', { days: 28 })
    })
  })
  describe('setCookie', function () {
    beforeEach(() => {
      document.cookie = ''
    })
    it('should set the cookie value based on the provided parameters', function () {
      window.MTCAdmin.CookieBanner.setCookie('seen_cookie_message', 'yes', { days: 28 })
      expect(document.cookie.split(';')[0]).toEqual('seen_cookie_message=yes')
    })
  })
  describe('getCookie', function () {
    beforeEach(() => {
      document.cookie = 'seen_cookie_message=yes; cookie2=the_value2'
    })
    it('should get the cookie based on the given name', function () {
      const cookieValue = window.MTCAdmin.CookieBanner.getCookie('seen_cookie_message')
      expect(cookieValue).toEqual('yes')
    })
    it('should return null if no cookie is found based on given name', function () {
      const cookieValue = window.MTCAdmin.CookieBanner.getCookie('random_cookie_name')
      expect(cookieValue).toBeNull()
    })
  })
})

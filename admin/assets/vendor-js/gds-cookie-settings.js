// https://github.com/alphagov/frontend/blob/master/app/assets/javascripts/modules/cookie-settings.js
window.GOVUK = window.GOVUK || {}
window.GOVUK.Modules = window.GOVUK.Modules || {};

(function (Modules) {
  function CookieSettings () {
    // constructor
  }

  CookieSettings.prototype.start = function ($module) {
    this.$module = $module[0]

    this.$module.submitSettingsForm = this.submitSettingsForm.bind(this)

    document.querySelector('form[data-module=cookie-settings]')
      .addEventListener('submit', this.$module.submitSettingsForm)

    this.setInitialFormValues()
  }

  CookieSettings.prototype.setInitialFormValues = function () {
    if (!window.GOVUK.cookie('cookies_policy')) {
      window.GOVUK.setDefaultConsentCookie()
    }

    const currentConsentCookie = window.GOVUK.cookie('cookies_policy')
    const currentConsentCookieJSON = JSON.parse(currentConsentCookie)

    // We don't need the essential value as this cannot be changed by the user
    delete currentConsentCookieJSON.essential

    for (const cookieType in currentConsentCookieJSON) {
      let radioButton

      if (currentConsentCookieJSON[cookieType]) {
        radioButton = document.querySelector('input[name=cookies-' + cookieType + '][value=on]')
      } else {
        radioButton = document.querySelector('input[name=cookies-' + cookieType + '][value=off]')
      }
      radioButton.checked = true
    }
  }

  CookieSettings.prototype.submitSettingsForm = function (event) {
    event.preventDefault()

    const formInputs = event.target.getElementsByTagName('input')
    const options = {}

    for (let i = 0; i < formInputs.length; i++) {
      const input = formInputs[i]
      if (input.checked) {
        const name = input.name.replace('cookies-', '')
        const value = input.value === 'on'

        options[name] = value
      }
    }

    window.GOVUK.setConsentCookie(options)
    window.GOVUK.setCookie('cookies_preferences_set', true, { days: 365 })

    this.fireAnalyticsEvent(options)

    this.showConfirmationMessage()

    return false
  }

  CookieSettings.prototype.fireAnalyticsEvent = function (consent) {
    let eventLabel = ''

    for (const option in consent) {
      const optionValue = consent[option] ? 'yes' : 'no'
      eventLabel += option + '-' + optionValue + ' '
    }

    if (GOVUK.analytics && GOVUK.analytics.trackEvent) {
      GOVUK.analytics.trackEvent('cookieSettings', 'Save changes', { label: eventLabel })
    }
  }

  CookieSettings.prototype.showConfirmationMessage = function () {
    const confirmationMessage = document.querySelector('div[data-cookie-confirmation]')
    const previousPageLink = document.querySelector('.cookie-settings__prev-page')
    const referrer = CookieSettings.prototype.getReferrerLink()

    document.body.scrollTop = document.documentElement.scrollTop = 0

    if (referrer && referrer !== document.location.pathname) {
      previousPageLink.href = referrer
      previousPageLink.style.display = 'inline'
    } else {
      previousPageLink.style.display = 'none'
    }

    confirmationMessage.style.display = 'block'
  }

  CookieSettings.prototype.getReferrerLink = function () {
    return document.referrer ? new URL(document.referrer).pathname : false
  }

  Modules.CookieSettings = CookieSettings
})(window.GOVUK.Modules)

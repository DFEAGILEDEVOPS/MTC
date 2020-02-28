document.addEventListener('DOMContentLoaded', function () {
  const cookieSettingsElement = document.querySelectorAll('form[data-module=cookie-settings]')
  const cookieSettingsModule = new GOVUK.Modules['CookieSettings']()
  cookieSettingsModule.start(cookieSettingsElement)
})

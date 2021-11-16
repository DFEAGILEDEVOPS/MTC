document.addEventListener('DOMContentLoaded', function () {
  const cookieSettingsElement = document.querySelectorAll('form[data-module=cookie-settings]')
  if (cookieSettingsElement && cookieSettingsElement.length > 0) {
    // eslint-disable-next-line no-undef
    const cookieSettingsModule = new GOVUK.Modules.CookieSettings()
    cookieSettingsModule.start(cookieSettingsElement)
  }
})

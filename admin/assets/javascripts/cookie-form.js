document.addEventListener('DOMContentLoaded', function () {
  const cookieSettingsElement = document.querySelectorAll('form[data-module=cookie-settings]')
  if (cookieSettingsElement && cookieSettingsElement.length > 0) {
    const cookieSettingsModule = new GOVUK.Modules.CookieSettings()
    cookieSettingsModule.start(cookieSettingsElement)
  }
})

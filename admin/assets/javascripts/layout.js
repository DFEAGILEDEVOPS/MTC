document.addEventListener('DOMContentLoaded', function () {
  window.GOVUKFrontend.initAll()
  const cookieElement = document.querySelectorAll('div[data-module=cookie-banner]')
  // eslint-disable-next-line no-undef
  const module = new GOVUK.Modules.CookieBanner()
  module.start(cookieElement)
})

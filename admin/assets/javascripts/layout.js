document.addEventListener('DOMContentLoaded', function () {
  window.GOVUKFrontend.initAll()
  const cookieElement = document.querySelectorAll('div[data-module=cookie-banner]')
   
  const module = new GOVUK.Modules.CookieBanner()
  module.start(cookieElement)
})

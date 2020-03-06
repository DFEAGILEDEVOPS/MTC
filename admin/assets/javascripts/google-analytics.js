document.addEventListener('DOMContentLoaded', function () {
  // Disable tracking if the opt-out cookie exists.
  // To disable analytics: window['ga-disable-UA-XXXXX-Y'] = true;
  // More info on https://developers.google.com/analytics/devguides/collection/analyticsjs/user-opt-out
  // eslint-disable-next-line no-undef
  const disableStr = 'ga-disable-' + googleTrackingId
  const consentCookie = window.GOVUK.getConsentCookie()
  window[disableStr] = consentCookie && !consentCookie.usage

  window.dataLayer = window.dataLayer || []
  // eslint-disable-next-line no-undef
  function gtag () { dataLayer.push(arguments) }

  gtag('js', new Date())
  // eslint-disable-next-line no-undef
  gtag('config', googleTrackingId, { anonymize_ip: true })
})

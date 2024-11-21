/* global googleTrackingId dataLayer args */
document.addEventListener('DOMContentLoaded', function () {
  // Disable tracking if the opt-out cookie exists.
  // To disable analytics: window['ga-disable-UA-XXXXX-Y'] = true;
  // More info on https://developers.google.com/analytics/devguides/collection/analyticsjs/user-opt-out
  const disableStr = 'ga-disable-' + googleTrackingId
  const consentCookie = window.GOVUK.getConsentCookie()
  window[disableStr] = consentCookie && !consentCookie.usage
  window.dataLayer = window.dataLayer || []
  function gtag () { dataLayer.push(...args) }
  gtag('js', new Date())
  gtag('config', googleTrackingId, { anonymize_ip: true })
})

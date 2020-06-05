'use strict'

if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

/**
 * Pupil status selection
 */
(function () {
  window.MTCAdmin.pupilStatusSelection = function () {
    const cards = document.querySelectorAll('.custom-card')
    for (let i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function () {
        var $relatedDetailsEl = document.getElementById(`${cards[i].id}-details`)
        if (!$relatedDetailsEl) { return false }
        var $summary = $relatedDetailsEl.getElementsByTagName('summary').item(0)
        if (!$summary) { return false }
        // We can't blindly use this open attribute as IE 11, which is using the polyfill, does not have it.
        // We can work around this by simulating a click on the <summary> element.
        // relatedDetailsEl.open = !relatedDetailsEl.open
        $summary.click()
      })
    }
  }
})()

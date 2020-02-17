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
        const relatedDetailsEl = document.getElementById(`${cards[i].id}-details`)
        if (relatedDetailsEl) {
          relatedDetailsEl.open = !relatedDetailsEl.open
        }
      })
    }
  }
})()

'use strict'

if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

/**
 * Pupil status selection
 */
(function () {
  window.MTCAdmin.pupilStatusSelection = function () {
    document.querySelectorAll('.custom-card').forEach(card => {
      card.addEventListener('click', function () {
        const relatedDetailsEl = document.getElementById(`${card.id}-details`)
        if (relatedDetailsEl) {
          relatedDetailsEl.open = !relatedDetailsEl.open
        }
      })
    })
  }
})()

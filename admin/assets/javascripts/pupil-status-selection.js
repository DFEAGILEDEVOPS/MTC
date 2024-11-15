'use strict'
 
if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

/**
 * Pupil status selection
 */
function toggleDetails (element) {
  var $relatedDetailsEl = document.getElementById(`${element.id}-details`)
  if (!$relatedDetailsEl) { return false }
  var $summary = $relatedDetailsEl.getElementsByTagName('summary').item(0)
  if (!$summary) { return false }
  // We can't blindly use this `open` attribute as IE 11, which is using the polyfill, does not have it.
  // We can work around this by simulating a click on the <summary> element.
  // relatedDetailsEl.open = !relatedDetailsEl.open
  $summary.click()
  return true
}

function clickHandler (event, toggleCtrlElement) {
  return toggleDetails(toggleCtrlElement)
}

function keyboardHandler (event, toggleCtrlElement) {
  // Make it accessible for keyboard users too
  var KEY_ENTER = 13
  var KEY_SPACE = 32

  switch (event.which) {
    case KEY_ENTER:
    case KEY_SPACE: {
      return toggleDetails(toggleCtrlElement)
    }
  }
  return false
}

(function () {
  // Bind event handlers to the traffic light boxes
  window.MTCAdmin.pupilStatusSelection = function () {
    const cards = document.querySelectorAll('.custom-card')
    for (let i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function (event) { clickHandler(event, cards[i]) })
      cards[i].addEventListener('keypress', function (event) { keyboardHandler(event, cards[i]) })
    }
  }
})()

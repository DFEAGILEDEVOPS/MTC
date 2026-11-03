'use strict'

;(function () {
  function refreshActiveRun () {
    const run = document.getElementById('dlq-reconciliation-run')
    if (run && run.dataset.active === 'true') {
      window.setTimeout(function () { window.location.reload() }, 5000)
    }
  }

  function initialiseRecentRuns () {
    const list = document.getElementById('dlq-recent-runs')
    const more = document.getElementById('dlq-runs-more')
    const less = document.getElementById('dlq-runs-less')
    const collapse = document.getElementById('dlq-runs-collapse')
    if (!list || !more || !less || !collapse) return
    const olderRuns = list.querySelectorAll('[data-older-run]')
    more.addEventListener('click', function (event) {
      event.preventDefault()
      olderRuns.forEach(function (run) { run.hidden = false })
      more.setAttribute('aria-expanded', 'true')
      more.hidden = true
      collapse.hidden = false
      olderRuns[0].querySelector('a').focus()
    })
    less.addEventListener('click', function () {
      olderRuns.forEach(function (run) { run.hidden = true })
      collapse.hidden = true
      more.hidden = false
      more.setAttribute('aria-expanded', 'false')
      more.focus()
    })
  }

  function initialise () {
    refreshActiveRun()
    initialiseRecentRuns()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise)
  } else {
    initialise()
  }
})()
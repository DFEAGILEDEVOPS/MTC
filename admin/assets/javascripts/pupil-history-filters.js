document.addEventListener('DOMContentLoaded', function () {
  const panel = document.getElementById('pupil-history-filter-options')
  if (!panel) return

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'govuk-button govuk-button--secondary'
  button.textContent = 'Filter'
  button.setAttribute('aria-controls', panel.id)

  const setExpanded = function (expanded) {
    button.setAttribute('aria-expanded', String(expanded))
    panel.hidden = !expanded
  }

  button.addEventListener('click', function () {
    setExpanded(button.getAttribute('aria-expanded') !== 'true')
  })

  setExpanded(panel.dataset.expanded === 'true')
  panel.before(button)
})

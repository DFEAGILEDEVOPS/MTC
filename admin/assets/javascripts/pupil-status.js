document.addEventListener('DOMContentLoaded', function () {
  const element = document.getElementById('step-by-step-navigation')
  const stepByStepNavigation = new GOVUK.Modules.StepByStepNavigation()
  stepByStepNavigation.start(element)
})

document.querySelectorAll('.custom-card').forEach(card => {
  card.addEventListener('click', function () {
    const relatedDetailsEl = document.getElementById(`${card.id}-details`)
    if (relatedDetailsEl) {
      relatedDetailsEl.open = !relatedDetailsEl.open
    }
  })
})

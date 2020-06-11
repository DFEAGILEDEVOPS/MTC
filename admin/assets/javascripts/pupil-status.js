document.addEventListener('DOMContentLoaded', function () {
  const element = document.getElementById('step-by-step-navigation')
  // eslint-disable-next-line no-undef
  const stepByStepNavigation = new GOVUK.Modules.StepByStepNavigation()
  stepByStepNavigation.start(element)

  // Bind actions to the coloured cards so they open and close the details elements
  window.MTCAdmin.pupilStatusSelection()
})

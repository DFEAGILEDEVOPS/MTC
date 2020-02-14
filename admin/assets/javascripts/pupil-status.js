document.addEventListener('DOMContentLoaded', function () {
  const element = document.getElementById('step-by-step-navigation')
  // eslint-disable-next-line no-undef
  const stepByStepNavigation = new GOVUK.Modules.StepByStepNavigation()
  stepByStepNavigation.start(element)
  window.MTCAdmin.pupilStatusSelection()
})

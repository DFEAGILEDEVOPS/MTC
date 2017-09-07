class WarmUpCompletePage < SitePrism::Page
  set_url '/warm-up/complete'

  element :heading, '.heading-xlarge', text: "Warm-up questions completed"
  element :completion_text, 'p.text', text: "You have completed the warm-up questions. Press ‘Start now’ when you are ready to start the real check."
  element :start_check, '#start-now-button'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'


end

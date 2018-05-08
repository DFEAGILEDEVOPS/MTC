class WarmUpCompletePage < SitePrism::Page
  set_url '/check'

  element :heading, '.heading-xlarge', text: "Practice completed"
  element :completion_text, 'p.lede'
  element :start_check, '#start-now-button'
  element :warm_up_label, '.warm-up-questions-label'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'

end

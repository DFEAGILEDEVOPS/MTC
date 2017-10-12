class WarmUpCompletePage < SitePrism::Page
  set_url '/check'

  element :heading, '.heading-xlarge', text: "Practise completed"
  element :completion_text, 'p.lede', text: "You have completed the practise questions. Press ‘Start check’ when you are ready to start the real check."
  element :start_check, '#start-now-button'
  element :warm_up_label, '.warm-up-questions-label'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'

end

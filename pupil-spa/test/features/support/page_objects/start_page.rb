class StartPage < SitePrism::Page
  set_url '/check/start'

  element :heading, '.heading-xlarge', text: "Instructions"
  element :bulleted_list_instructions, '.list-bullet'
  element :start_check, '#start-now-button'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'

end

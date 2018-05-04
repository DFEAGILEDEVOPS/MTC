class StartPage < SitePrism::Page
  set_url '/check-start'

  element :heading, '.heading-xlarge', text: "What to expect"
  elements :bulleted_list_instructions, '.list-bullet li'
  element :start_warm_up, '#start-now-button'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'
  element :number_of_questions, 'li strong'

end

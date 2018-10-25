class WarmUpCompletePage < SitePrism::Page
  set_url '/check'

  element :heading, '.heading-xlarge', text: "Practice completed"
  element :start_check, '#start-now-button'

end

class WarmUpCompletePage < SitePrism::Page
  set_url '/check'

  element :heading, '.aa-title-size', text: "Practice completed"
  element :start_check, '#start-now-button'

end

class MTCCheckStartPage < SitePrism::Page
  set_url '/check'

  element :heading, '.aa-title-size', text: 'Multiplication tables check questions'
  element :questions, "p.aa-lead-size"
  element :start_now, "#start-now-button"

end

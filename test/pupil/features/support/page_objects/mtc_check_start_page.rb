class MTCCheckStartPage < SitePrism::Page
  set_url '/check'

  element :heading, '.heading-xlarge', text: 'Multiplication tables check questions'
  element :questions, "p.lede"
  element :start_now, "#start-now-button"

end

class FeedbackPage < SitePrism::Page
  set_url '/feedback'

  element :heading, '.heading-large', text: "Give feedback"
  element :title, '.heading-medium', text: "How easy or difficult was it to enter your answers today??"

  element :very_easy, "#satisfaction-rating-1"
  element :easy, "#satisfaction-rating-2"
  element :neither, "#satisfaction-rating-3"
  element :difficult, "#satisfaction-rating-4"
  element :very_difficult, "#satisfaction-rating-5"

  element :submit, '.button'
end

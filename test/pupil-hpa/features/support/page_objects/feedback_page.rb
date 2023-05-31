class FeedbackPage < SitePrism::Page
  set_url '/feedback'

  element :heading, '.heading-xlarge', text: "Give feedback"
  element :question, '.heading-medium', text: "How did you find the multiplication tables check?"

  element :very_easy, "#satisfaction-rating-1"
  element :easy, "#satisfaction-rating-2"
  element :neither, "#satisfaction-rating-3"
  element :difficult, "#satisfaction-rating-4"
  element :very_difficult, "#satisfaction-rating-5"

  element :submit, '.button'
end

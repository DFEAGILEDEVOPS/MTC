class FeedbackPage < SitePrism::Page
  set_url '/feedback'

  element :heading, '.heading-large', text: "Give feedback"
  element :title, '.heading-medium', text: "Overall, how did you feel about the service you used today?"
  element :touchscreen, "#input-type-1"
  element :mouse, "#input-type-2"
  element :keyboard, "#input-type-3"
  element :mix, "#input-type-4"

  element :very_easy, "#satisfaction-rating-1"
  element :easy, "#satisfaction-rating-2"
  element :neither, "#satisfaction-rating-3"
  element :difficult, "#satisfaction-rating-4"
  element :very_difficult, "#satisfaction-rating-5"


  element :comments_field, '.textarea'
  element :text_limit, 'p', text: '(Limit is 1200 characters)'

  element :submit, '.button'
end

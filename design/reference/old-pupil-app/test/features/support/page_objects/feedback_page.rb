class FeedbackPage < SitePrism::Page
  set_url '/check/feedback'

  element :heading, '.heading-large', text: "Give feedback"
  element :title, '.heading-medium', text: "Overall, how did you feel about the service you used today?"
  element :touchscreen, "#radio-0[value='Touchscreen']"
  element :mouse, "#radio-1[value='Mouse']"
  element :keyboard, "#radio-2[value='Keyboard']"
  element :mix, "#radio-3[value='Mix of the above']"

  element :very_easy, "#radio-0[value='Very easy']"
  element :easy, "#radio-1[value='Easy']"
  element :neither, "#radio-2[value='Neither easy or difficult']"
  element :difficult, "#radio-3[value='Difficult']"
  element :very_difficult, "#radio-4[value='Very difficult']"


  element :comments_field, '.textarea'
  element :text_limit, 'p', text: '(Limit is 1200 characters)'

  element :submit, '.button'
end

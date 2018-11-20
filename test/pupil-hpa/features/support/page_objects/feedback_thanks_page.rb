class FeedbackThanksPage < SitePrism::Page
  set_url '/feedback-thanks'

  element :feedback_thanks, '.aa-title-size', text: 'Thank you for your feedback'
  element :next_pupil, "a[href='/sign-out']"

end

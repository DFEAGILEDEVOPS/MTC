class FeedbackThanksPage < SitePrism::Page
  set_url '/feedback-thanks'

  element :feedback_thanks, '.heading-xlarge', text: 'Thank you for your feedback'
  element :next_pupil, "a[href='/sign-out']"

end

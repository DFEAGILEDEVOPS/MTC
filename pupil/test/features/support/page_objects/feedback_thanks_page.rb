class FeedbackThanksPage < SitePrism::Page
  set_url '/check/feedback-thanks'

  element :feedback_thanks, '.heading-xlarge', text: 'Thank you for your feedback'
  element :next_pupil, '#sign-out'

end

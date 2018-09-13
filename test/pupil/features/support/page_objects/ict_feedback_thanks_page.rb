class FeedbackThanksPage < SitePrism::Page
  set_url '/ict-survey/feedback-thanks/completed'

  element :feedback_thanks, '.heading-xlarge', text: 'Thank you for your feedback'
  element :feedback_message, 'p.lede', text: 'We appreciate the time you took to give us feedback, your opinion is important to us.'
  element :preview_mtc, "a[href='/check-start']"

end

class CreateMessagePage < SitePrism::Page
  set_url '/service-message'

  element :heading, '.govuk-heading-xl', text: 'Create service message'
  element :title, '#serviceMessageTitle'
  element :message, '#serviceMessageContent'
  element :submit, '#submit-service-message-button'
  element :cancel, 'a', text: 'Cancel'

  def create_message(title_text,message_text)
    title.set title_text
    message.set message_text
    submit.click
  end

end

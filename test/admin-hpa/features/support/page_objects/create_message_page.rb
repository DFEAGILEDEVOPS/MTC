class CreateMessagePage < SitePrism::Page
  set_url '/service-message'

  element :heading, '.govuk-heading-xl', text: 'Create service message'
  element :title, '#serviceMessageTitle'
  element :select_colour, '#borderColourCode'
  element :submit, '#submit-service-message-button'
  element :cancel, 'a', text: 'Cancel'

  def create_message(title_text,message_text, colour)
    title.set title_text
    select_colour.select(colour)
    page.execute_script("simplemde.value('#{message_text}')")
    submit.click
  end

end

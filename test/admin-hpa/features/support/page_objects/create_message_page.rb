class CreateMessagePage < SitePrism::Page
  set_url '/service-message/service-message-form'

  element :heading, '.govuk-heading-xl', text: 'Create service message'
  element :title, '#serviceMessageTitle'
  element :select_colour, '#borderColourCode'
  element :submit, '#submit-service-message-button'
  element :cancel, 'a', text: 'Cancel'

  element :targeted_message_toggle, '.govuk-details__summary'
  element :access_arrangements_page, '#area-A'
  element :declaration_page, '#area-H'
  element :tio_or_live_pins_page, '#area-P'
  element :group_pupils_page, '#area-G'
  element :pupil_register_page, '#area-T'
  element :pupil_status_page, '#area-S'
  element :pupils_not_taking_check_page, '#area-N'
  element :restarts_page, '#area-R'
  element :school_landing_page, '#area-L'
  element :results_page, '#area-M'

  def create_message(title_text, message_text, colour, target_area = nil)
    title.set title_text
    if target_area
      targeted_message_toggle.click
      send(target_area).click
    end
    select_colour.select(colour)
    page.execute_script("simplemde.value('#{message_text}')")
    submit.click
  end

end

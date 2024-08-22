class ManageServiceMessagePage < SitePrism::Page
  set_url '/service-message'

  element :heading, '.govuk-heading-xl', text: 'Service message'
  element :info_text, '.govuk-body', text: 'Add or delete a service message for any area of the site.'
  element :create_message, '.govuk-button', text: 'Create service message'
  element :no_message, '.govuk-body', text: 'No service message created'
  element :flash_message, '.govuk-info-message'
  elements :message, '.name-text-wrap'
  element :edit, 'a', text: 'Edit'
  elements :remove_message, '.govuk-button-as-link', text: 'Remove'

  section :message_list, '#submitted-service-message' do
    sections :rows, 'tbody tr' do
      element :title, '.name-text-wrap'
      element :edit, 'a', text: 'Edit'
      element :remove, '#js-modal-link', text: 'Remove'
    end
  end

  def remove_all_service_messages
    (remove_message.size).times do |index|
      remove_message.first.click
      visit current_url
    end
  end

  def remove_specific_service_message(message_title)
    message = message_list.rows.find {|row| row.title.text == message_title}
    message.remove.click
  end

end

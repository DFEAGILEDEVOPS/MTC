class ManageServiceMessagePage < SitePrism::Page
  set_url '/service-message'

  element :heading, '.govuk-heading-xl', text: 'Service message'
  element :info_text, '.govuk-body', text: 'Add or delete a service message for any area of the site.'
  element :create_message, '.govuk-button', text: 'Create service message'
  element :no_message, '.govuk-body', text: 'No service message created'
  element :flash_message, '.govuk-info-message'
  element :message, '.name-text-wrap'
  element :edit, 'a', text: 'Edit'
  element :remove_message, '.govuk-button-as-link', text: 'Remove'

  section :modal, '.modal-box.show' do
    element :heading, '#modal-title'
    element :contents, '.modal-content p'
    element :cancel, '#js-modal-cancel-button'
    element :confirm, '#js-modal-confirmation-button'

  end

  def remove_service_message
    remove_message.click
    modal.confirm.click
  end

end

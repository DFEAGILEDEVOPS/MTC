class ManageServiceMessagePage < SitePrism::Page
  set_url '/service-message'

  element :heading, '.govuk-heading-xl', text: 'Service message'
  element :info_text, '.govuk-body', text: 'Add, edit or delete a service message for schools.'
  element :create_message, '.govuk-button', text: 'Create service message'
  element :no_message, '.govuk-body', text: 'No service message created'
  element :flash_message, '.govuk-info-message'
  element :message, 'a[href="/service-message/edit-service-message/"]'
  element :remove_message, '.govuk-button-as-link', text: 'Remove'

end

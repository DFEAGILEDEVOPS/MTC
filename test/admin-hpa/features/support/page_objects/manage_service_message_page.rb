class ManageServiceMessagePage < SitePrism::Page
  set_url '/service-message'

  element :heading, '.govuk-heading-xl', text: 'Service message'
  element :info_text, '.govuk-body', text: 'Add or delete a service message for schools.'
  element :create_message, '.govuk-button', text: 'Create service message'
  element :no_message, '.govuk-body', text: 'No service message created'
  element :flash_message, '.govuk-info-message'
  element :message, '.name-text-wrap'
  element :remove_message, '.govuk-button-as-link', text: 'Remove'

end

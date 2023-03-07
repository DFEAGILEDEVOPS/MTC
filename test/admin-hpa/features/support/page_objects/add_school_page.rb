class AddSchoolPage < SitePrism::Page
  set_url '/service-manager/organisations/add'

  element :heading, '.govuk-heading-xl', text: 'Add organisation'
  element :school_name, '#name'
  element :dfe_number, '#dfeNumber'
  element :urn, '#urn'
  element :add_school, 'button', text: 'Add'
  element :cancel, 'a', text: 'Cancel'
  elements :error_messages, '.govuk-error-message'
  element :type_of_establishment, "#typeOfEstablishmentCode"
  element :is_test_school, "#isTestSchool"


  section :error_summary, ".govuk-error-summary__list" do
    element :error_text, 'p', text: 'See highlighted errors below.'
    elements :error_messages, '.govuk-list li'
  end


end

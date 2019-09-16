class UpdateSchoolPage < SitePrism::Page
  set_url '/mod-settings/add-school'

  element :heading, '.govuk-heading-xl'
  element :school_name, '#schoolName'
  element :urn, '#urn'
  element :country, '#timezone'
  elements :school_name_auto_complete, '#schoolName__listbox li'
  elements :urn_auto_complete, '#urn__listbox li'
  elements :country_auto_complete, '#timezone__listbox li'
  element :timezone_selected, '#timezone__listbox option[selected]'
  element :save, '.govuk-button[value="Save"]'
  element :cancel, 'a[href="/service-manager/mod-settings"]'
  elements :error_summary,'.govuk-error-summary__list li'
  elements :error_message,'.govuk-error-message'
end

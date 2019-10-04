class HelpdeskImpersonationPage < SitePrism::Page
  set_url '/helpdesk/school-impersonation'

  element :heading, '.govuk-heading-xl'
  element :dfe_number, '#dfeNumber'
  element :submit, '#submit-dfew-number'
  element :impersonation_removed, '.govuk-info-message', text: 'School impersonation has been removed'
  elements :error_summary,'.govuk-error-summary__list li'
  elements :error_message,'.govuk-error-message'
  element :sign_out, '.govuk-link', text: 'Sign out'

end

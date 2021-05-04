class SchoolSearchResultsPage < SitePrism::Page

  element :heading, '.govuk-heading-xl'
  element :dfe_number, '.govuk-summary-list__row:nth-of-type(1) dd'
  element :urn, '.govuk-summary-list__row:nth-of-type(2) dd'
  element :lea_code, '.govuk-summary-list__row:nth-of-type(3) dd'
  element :estab, '.govuk-summary-list__row:nth-of-type(4) dd'
  element :number_of_pupils, '.govuk-summary-list__row:nth-of-type(5) dd'
  element :edit, '.govuk-button', text: 'Edit organisation'
  element :back_to_search, '.govuk-button', text: 'Back to search'

end

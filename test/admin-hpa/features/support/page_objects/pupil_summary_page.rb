class PupilSummaryPage < SitePrism::Page
  set_url '/service-manager/pupil-summary/{id}'

  element :pupil_name, '.govuk-heading-xl'
  element :dob, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(1) dd'
  element :upn, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(2) dd'
  element :pupil_id, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(3) dd'
  element :school, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(4) dd'
  element :dfe_number, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(5) dd'
  element :urn, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(6) dd'
  element :status, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(7) dd'

end

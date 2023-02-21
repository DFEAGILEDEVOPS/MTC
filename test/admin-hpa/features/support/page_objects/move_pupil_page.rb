class MovePupilPage < SitePrism::Page
  set_url '/service-manager/pupil/move/{id}'

  element :pupil_name, '.govuk-heading-xl'
  element :move_heading, '.govuk-heading-m'

  element :error_summary, '.govuk-error-summary__list'
  element :error_message, '.govuk-error-message'

  element :dob, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(1) dd'
  element :upn, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(2) dd'
  element :pupil_id, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(3) dd'
  element :school, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(4) dd'
  element :dfe_number, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(5) dd'
  element :urn, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(6) dd'
  element :status, '.govuk-summary-list .govuk-summary-list__row:nth-of-type(7) dd'
  element :target_school_urn, '#targetSchoolURN'
  element :confirm, '#searchh-btn'
  element :cancel, '.govuk-button', text: 'Cancel'

end

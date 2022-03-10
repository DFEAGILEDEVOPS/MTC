class CheckViewPage < SitePrism::Page
  set_url '/checkview'

  element :heading, '.govuk-heading-xl', text: 'Tech Support Check View'
  element :check_code, '#checkCode'
  element :submit, '#submit-checkcode'
  elements :errors, '.govuk-error-summary__list li'
  element :not_valid_error, '.govuk-error-message', text: 'checkCode is not a valid UUID'
  element :required_error, '.govuk-error-message', text: 'checkCode is required'
  element :processing_error, '.govuk-notification-banner__heading'

  section :check_summary, '#checkSummary' do
    element :caption, 'govuk-table__caption'
    element :check_code, 'tr:nth-of-type(1) td:last-of-type'
    element :check_id, 'tr:nth-of-type(2) td:last-of-type'
    element :type, 'tr:nth-of-type(3) td:last-of-type'
    element :created_at, 'tr:nth-of-type(4) td:last-of-type'
    element :school_name, 'tr:nth-of-type(5) td:last-of-type'
    element :dfe_number, 'tr:nth-of-type(6) td:last-of-type'
    element :pupil_login_date, 'tr:nth-of-type(7) td:last-of-type'
    element :recieved_at, 'tr:nth-of-type(8) td:last-of-type'
    element :pin_expires_at, 'tr:nth-of-type(9) td:last-of-type'
    element :view_payload, '#view-received-check'
    element :payload_not_avail, 'tr:nth-of-type(10) td:last-of-type', text: 'N/A'
  end

  section :related, '.govuk-list' do
    element :marked_check_not_avail, 'li', text: 'Marked check: N/A'
    element :received_check_not_avail, 'li', text: 'Received check: N/A'
    element :view_marked_check, '.govuk-link', text: 'View marked check'
    element :view_received_check, '.govuk-link', text: 'View received check'

  end

end

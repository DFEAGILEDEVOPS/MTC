class DeclarationConfirmPage < SitePrism::Page
  set_url '/attendance/confirm-and-submit'
  element :heading, '.govuk-heading-xl', text: "Confirm and submit"
  element :confirm, '#confirmYes'
  element :unable_to_confirm, '#confirmNo'
  element :form, 'form'
  element :confirm_pupil_details, '#pupilDetails'
  element :unique_pins, '#uniquePins'
  element :confirm_staff, '#staffConfirm'
  element :confirm_no_disruption, '#disruptionConfirm'
  element :submit_button, 'input[value="Submit"]'
  element :cancel_button, "a.govuk-button", text: "Cancel"
  elements :error_messages, '.govuk-error-message'
  section :error_summary, ErrorSummary, 'div[aria-labelledby="error-summary-title"]'

  def submit_invalid_confirmed
    confirm.click
    confirm_pupil_details.click
    submit_button.click
  end

  def submit_valid_confirmed
    confirm.click
    confirm_pupil_details.click
    unique_pins.click
    confirm_staff.click
    confirm_no_disruption.click
    submit_button.click
  end

  def submit_not_confirmed
    unable_to_confirm.click
    submit_button.click
  end
end

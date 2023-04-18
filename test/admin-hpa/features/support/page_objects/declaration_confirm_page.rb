class DeclarationConfirmPage < SitePrism::Page
  set_url '/attendance/confirm-and-submit'
  element :heading, '.govuk-heading-xl', text: "Confirm and submit"

    element :confirm, '#confirmAll'
  element :confirm_pupil_details, '#pupilDetails'
  element :confirm_correct_reasons, '#correctReasons'
  element :confirm_unique_pins, '#uniquePins'
  element :confirm_staff, '#staffConfirm'
  element :confirm_no_disruption, '#disruptionConfirm'

  element :confirm_none, '#confirmNo'

  element :unable_to_confirm, '#confirmNo'
  element :further_info, '#noPupilsFurtherInfo'



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
    confirm_correct_reasons.click
    confirm_unique_pins.click
    confirm_staff.click
    confirm_no_disruption.click
    submit_button.click
  end

  def submit_not_confirmed
    unable_to_confirm.click
    further_info.set 'further information'
    submit_button.click
  end
end

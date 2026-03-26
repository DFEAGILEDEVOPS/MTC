class DeclarationConfirmPage < SitePrism::Page
  set_url '/attendance/confirm-and-submit'
  element :heading, '.govuk-heading-xl', text: "Confirm and submit"

  element :confirm, '#confirmAll'

  element :confirm_none, '#confirmNone'

  element :unable_to_confirm, '#confirmNo'
  element :further_info, '#noPupilsFurtherInfo'



  element :submit_button, 'input[value="Submit"]'
  element :cancel_button, "a.govuk-button", text: "Cancel"
  elements :error_messages, '.govuk-error-message'
  section :error_summary, ErrorSummary, 'div[aria-labelledby="error-summary-title"]'

  def submit_invalid_confirmed
    confirm_none.click
    submit_button.click
  end

  def submit_valid_confirmed
    confirm.click
    submit_button.click
  end

  def submit_not_confirmed
    unable_to_confirm.click
    further_info.set 'further information'
    submit_button.click
  end
end

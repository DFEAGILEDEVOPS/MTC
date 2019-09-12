class DeclarationConfirmPage < SitePrism::Page
  set_url '/attendance/confirm-and-submit'
  element :heading, '.govuk-heading-xl', text: "Confirm and submit"
  element :form, 'form'
  element :submit_button, 'input[value="Submit"]'
  element :cancel_button, "a.govuk-button", text: "Cancel"
  elements :error_messages, '.govuk-error-message'
  section :error_summary, ErrorSummary, 'div[aria-labelledby="error-summary-title"]'

  def submit_invalid_confirmed()
    form.first('#confirmYes').click
    form.first('#pupilDetails').click
    submit_button.click
  end

  def submit_valid_confirmed()
    form.first('#confirmYes').click
    form.first('#pupilDetails').click
    form.first('#uniquePins').click
    form.first('#staffConfirm').click
    submit_button.click
  end

  def submit_not_confirmed()
    form.first('#confirmNo').click
    submit_button.click
  end
end

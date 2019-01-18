class DeclarationConfirmPage < SitePrism::Page
  set_url '/attendance/confirm-and-submit'
  element :heading, '.heading-xlarge', text: "Confirm and submit"
  element :form, 'form'
  element :submit_button, "button", text: "Submit"
  element :cancel_button, "a.button-secondary", text: "Cancel"
  elements :error_messages, '.error-message'
  section :error_summary, ErrorSummary, 'div[aria-labelledby="error-summary-heading-1"]'

  def submit_invalid_details()
    form.first('#confirmYes').click
    form.first('#pupilDetails').click
    submit_button.click
  end

  def submit_valid_details()
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
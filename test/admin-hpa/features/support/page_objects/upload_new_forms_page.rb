class UploadNewFormsPage < SitePrism::Page
  set_url '/test-developer/upload-new-forms'

  element :heading, '.govuk-heading-xl', text: 'Upload new form'
  element :download_form_example_template, '.govuk-list .govuk-icon-download'
  elements :new_form_info_message, '.govuk-list li'
  element :chose_file, '#csvFiles'
  element :live_check_form, "#checkFormType[value='L']"
  element :familiarisation_check_form, "#checkFormType[value='F']"
  elements :error_messages, '.govuk-error-summary__list li a'
  element :upload, '#upload-form-submit'
  elements :upload_area_error, '.error_message'

  element :cancel, 'a.govuk-button--secondary'
  element :confirm_overwrite, '#js-modal-confirmation-button'
  element :cancel_overwrite, '#js-modal-cancel-button'


  def create_unique_check_csv(file_name, file_contents)
    out_file = File.new(file_name, "w")
    out_file.puts(file_contents)
    out_file.close
  end

  def delete_csv_file(file_name)
    File.delete(file_name)
  end

  def submit_upload
    upload.click
    confirm_overwrite.click if confirm_overwrite.visible?
  end

end

class UploadNewFormsPage < SitePrism::Page
  set_url '/check-form/upload-new-forms'

  element :heading, '.heading-xlarge', text: 'Upload new form'
  element :download_form_example_template, '.numeric-list a[href="/csv/check-form-sample.csv"]'
  elements :new_form_info_message, '.numeric-list li'
  element :chose_file, '#file-upload'
  element :live_check_form, '#live-check-form'
  element :familiarisation_check_form, '#familiarisation-check-form'

  element :upload, 'input[value="Upload"]'
  element :cancel, 'a.button-secondary'

end

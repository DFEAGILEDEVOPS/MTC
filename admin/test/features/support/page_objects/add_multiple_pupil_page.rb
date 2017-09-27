class AddMultiplePupilPage < SitePrism::Page
  set_url '/school/pupil/add-batch-pupils'

  element :heading, '.heading-xlarge'
  elements :sub_heading, '.heading-medium'
  elements :info_message, '.list-number li'
  element :pupil_upload_template, '.pupils-template a', text: 'Pupil details template'
  element :chose_file, '#file-input'
  element :save, 'input[value="Save"]'
  element :back, 'a.button.button-secondary'
end
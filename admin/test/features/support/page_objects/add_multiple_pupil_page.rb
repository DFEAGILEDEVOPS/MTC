class AddMultiplePupilPage < SitePrism::Page
  set_url '/school/pupil/add-batch-pupils'

  element :heading, '.heading-xlarge'
  elements :sub_heading, '.heading-medium'
  elements :info_message, '.list-number li'
  element :pupil_upload_template, '.pupils-template a', text: 'Pupil details template'
  element :chose_file, '#template-upload'
  element :save, 'input[value="Save"]'
  element :back, 'a.button.button-secondary'
  element :error_message, '.error-summary'
  element :error_csv_file, '.error-summary .template-link'


  def upload_multiple_pupil(pupil_array1, pupil_array2)
    CSV.open(File.expand_path("#{File.dirname(__FILE__)}/../../../data/multiple_pupils_template.csv"), 'wb') do |csv_object|
      csv_object << ["First name","Middle name(s)","Last name","UPN","Date of Birth","Gender"]
      csv_object << pupil_array1
      csv_object << pupil_array2
    end
    page.attach_file('template-upload', File.expand_path("#{File.dirname(__FILE__)}/../../../data/multiple_pupils_template.csv"))
  end

end
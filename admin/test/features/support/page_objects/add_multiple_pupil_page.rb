class AddMultiplePupilPage < SitePrism::Page
  set_url '/school/pupil/add-batch-pupils'

  element :heading, '.heading-xlarge'
  elements :sub_heading, '.heading-medium'
  elements :info_message, '.list-number li'
  element :pupil_upload_template, '.pupils-template a', text: 'Pupil details template'
  element :chose_file, '#file-upload'
  element :save, 'input[value="Upload"]'
  element :back, 'a.button.button-secondary'
  element :error_message, '.error-summary'
  element :error_csv_file, '.error-summary .template-link'


  def upload_multiple_pupil(pupil_array1, pupil_array2=nil)
    CSV.open(File.expand_path("#{File.dirname(__FILE__)}/../../../data/multiple_pupils_template.csv"), 'wb') do |csv_object|
      csv_object << ["Surname","Forename","Middle name(s)","Date of Birth","Gender", "UPN"]
      csv_object << pupil_array1
      csv_object << pupil_array2 if !pupil_array2.nil?
    end
    page.attach_file('file-upload', File.expand_path("#{File.dirname(__FILE__)}/../../../data/multiple_pupils_template.csv"))
  end

end
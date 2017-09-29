class AddMultiplePupilPage < SitePrism::Page
  set_url '/school/pupil/add-batch-pupils'

  element :heading, '.heading-xlarge'
  elements :sub_heading, '.heading-medium'
  elements :info_message, '.list-number li'
  element :pupil_upload_template, '.pupils-template a', text: 'Pupil details template'
  element :chose_file, '#file-input'
  element :save, 'input[value="Save"]'
  element :back, 'a.button.button-secondary'


  def upload_multiple_pupil(pupil_array)
    CSV.open(File.expand_path("#{File.dirname(__FILE__)}/../../../data/multiple_pupils_template.csv"), 'wb') do |csv_object|
      csv_object << ["First name","Middle name(s)","Last name","UPN","Date of Birth","Gender"]
      csv_object << pupil_array
    end
    page.attach_file('file-input', File.expand_path("#{File.dirname(__FILE__)}/../../../data/multiple_pupils_template.csv"))
  end

end
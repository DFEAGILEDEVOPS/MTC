class AddMultiplePupilPage < SitePrism::Page
  set_url '/school/pupil/add-batch-pupils'

  element :heading, '.heading-xlarge'
  elements :sub_heading, '.heading-medium'
  elements :info_message, '.list-number li'
  element :pupil_upload_template, '.pupils-template a', text: 'Pupil details template'
  element :chose_file, '#file-upload'
  element :save, 'input[value="Upload"]'
  element :back, 'a.button.button-secondary'
  element :error_message, 'div[aria-labelledby="error-summary-heading-1"]'
  element :error_csv_file, '.error-summary .template-link'
  element :csrf, 'input[name="_csrf"]', visible: false


  def upload_multiple_pupil(pupil_array1, pupil_array2=nil)
    CSV.open(File.expand_path("#{File.dirname(__FILE__)}/../../../data/multiple_pupils_template.csv"), 'wb') do |csv_object|
      csv_object << ["Surname","Forename","Middle name(s)","Date of birth","Gender", "UPN"]
      csv_object << pupil_array1
      csv_object << pupil_array2 if !pupil_array2.nil?
    end
    page.attach_file('file-upload', File.expand_path("#{File.dirname(__FILE__)}/../../../data/multiple_pupils_template.csv"))
  end

  def upload_multiple_pupil_with_moreThan300Rows()
    page.attach_file('file-upload', File.expand_path("#{File.dirname(__FILE__)}/../../../data/multiple_pupils_template_moreThan300Rows.csv"))
  end

  def get_dob_for_pupil_for_multiple_upload
    dob = []
    cur_date = Time.now
    old_date1 = (cur_date - ((86400 * 365)*10)).strftime('%d/%m/%Y')
    old_date2 = (cur_date - ((86400 * 365)*10)).strftime('%d/%m/%Y')
    dob << old_date1
    dob << old_date2
    dob
  end

  def create_and_upload_multiple_pupils(number,file_name)
    @upn_list = []
    CSV.open("data/#{file_name}", "wb") do |csv|
      csv << ["Surname","Forename","Middle name(s)","Date of birth","Gender","UPN"]
      number.to_i.times do
        upn = UpnGenerator.generate
        @upn_list << upn
        csv << ["#{(0...8).map { (65 + rand(26)).chr }.join}","#{(0...8).map { (65 + rand(26)).chr }.join}", "","03/12/2008","f",upn]
      end
    end
    page.attach_file('file-upload', File.expand_path("#{File.dirname(__FILE__)}/../../../data/#{file_name}"))
    save.click
    File.delete("data/#{file_name}")
    @upn_list
  end

end

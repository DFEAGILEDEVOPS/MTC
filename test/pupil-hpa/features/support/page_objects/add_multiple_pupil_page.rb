class AddMultiplePupilPage < SitePrism::Page
  set_url '/pupil-register/pupil/add-batch-pupils/'

  element :heading, '.govuk-heading-xl'
  elements :sub_heading, '.govuk-heading-m'
  elements :info_message, '.govuk-list li'
  element :pupil_upload_template, '.pupils-template a', text: 'Pupil details template'
  element :chose_file, '#file-upload'
  element :save, '#upload-form-submit'
  element :back, 'a', text: 'Cancel'
  element :error_message,  "div[data-module='govuk-error-summary']"
  element :error_csv_file, '.govuk-pupil-error-template'
  element :csrf, 'input[name="_csrf"]', visible: false


  def upload_multiple_pupil(pupil_array1, pupil_array2=nil)
    CSV.open(File.expand_path("#{File.dirname(__FILE__)}/../../../data/multiple_pupils_template.csv"), 'wb') do |csv_object|
      csv_object << ["Surname","Forename","Middle name(s)","Date of birth","Sex", "UPN"]
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

  def upload_pupils(number_of_pupils,school_name)
    @new_upn_list = []
    CSV.open("data/school_#{school_name.gsub(' ', '').downcase}.csv", "wb") do |csv|
      csv << ["Surname","Forename","Middle name(s)","Date of birth","Sex", "UPN"]
      @dob = Time.now
      @gender = ['M','F']
      number_of_pupils.times do
        @dob += 86400
        @pupil_dob = (@dob - ((86400 * 365)*10)).strftime('%d/%m/%Y')
        @name = (0...8).map {(65 + rand(26)).chr}.join
        upn = UpnGenerator.generate
        @new_upn_list << upn
        csv << [@name, @name, @name, @pupil_dob,@gender.sample, upn]
      end
    end
    page.attach_file('file-upload', File.expand_path("#{File.dirname(__FILE__)}/../../../data/school_#{school_name.gsub(' ', '').downcase}.csv"))
    save.click
    File.delete("data/school_#{school_name.gsub(' ', '').downcase}.csv")
    @new_upn_list
  end

  def create_and_upload_multiple_pupils(number,file_name)
    @upn_list = []
    CSV.open("data/#{file_name}", "wb") do |csv|
      csv << ["Surname","Forename","Middle name(s)","Date of birth","Sex","UPN"]
      number.to_i.times do
        upn = UpnGenerator.generate
        @upn_list << upn
        csv << ["#{(0...8).map { (65 + rand(26)).chr }.join}","#{(0...8).map { (65 + rand(26)).chr }.join}", "","02/1/2011","f",upn]
      end
    end
    page.attach_file('file-upload', File.expand_path("#{File.dirname(__FILE__)}/../../../data/#{file_name}"))
    save.click
    File.delete("data/#{file_name}")
    @upn_list
  end

end

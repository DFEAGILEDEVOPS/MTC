class UploadPupilCensusPage < SitePrism::Page
  set_url '/service-manager/upload-pupil-census'

  element :heading, '.govuk-heading-xl', text: 'Upload pupil census'
  element :file_upload, '#file-upload'
  element :upload, '#upload-form-submit'
  element :cancel, 'a[href="/service-manager/home"]'
  element :uploaded_title, ".govuk-body", text: "Uploaded file"
  element :download_template, 'a[href="/csv/mtc-census-headers.csv"]'
  element :csrf, 'input[name="_csrf"]', visible: false
  section :error_summary, 'div[aria-labelledby="error-summary-title"]' do
    element :error_heading, 'h2', text: 'You need to fix the errors on this page before continuing.'
    element :error_text, 'p', text: 'See highlighted errors below'
    elements :error_messages, '.govuk-error-summary__list li'
  end
  element :error_message, '.govuk-error-message'

  section :uploaded_file, 'dl.pupil-census-uploaded-file' do
    element :file, 'dd:nth-of-type(1)'
    element :status, 'dd:nth-of-type(2)'
  end
  section :removal_modal, '.modal-buttons' do
    element :yes, '.modal-confirm'
    element :no, '.modal-cancel'
  end
  element :removal_message, '.info-message', text: 'Pupil data successfully removed'


  def create_unique_check_csv(file_name, file_contents)
    out_file = File.new(file_name, "w")
    out_file.puts(file_contents)
    out_file.close
  end

  def upload_pupil_census_data_with_duplicate_upn(condition)
    case condition
      when 'duplicate upn'
        page.attach_file('file-upload', File.expand_path("#{File.dirname(__FILE__)}/../../../data/fixtures/pupil-census-data_error.csv"))
      when 'empty last name'
        page.attach_file('file-upload', File.expand_path("#{File.dirname(__FILE__)}/../../../data/fixtures/pupilCensusDataEmptyLastname.csv"))
      when 'empty first name'
        page.attach_file('file-upload', File.expand_path("#{File.dirname(__FILE__)}/../../../data/fixtures/pupilCensusDataEmptyForname.csv"))
      when 'empty gender'
        page.attach_file('file-upload', File.expand_path("#{File.dirname(__FILE__)}/../../../data/fixtures/pupilCensusDataEmptyGender.csv"))
    end
  end

  def upload__pupil_census(filename, pupil_array1, pupil_array2=nil)
    CSV.open(File.expand_path("#{File.dirname(__FILE__)}/../../../data/fixtures/#{filename}"), 'wb') do |csv_object|
      csv_object << ["LEA","Estab", "UPN","Surname","Forename","Middlenames","Sex","DOB"]
      csv_object << pupil_array1
      csv_object << pupil_array2 if !pupil_array2.nil?
    end

    if !(SqlDbHelper.get_jobs.last.nil?)
      begin
        wait_until(10){SqlDbHelper.get_jobs.last['jobStatus_id'].eql?(3)|| SqlDbHelper.get_jobs.last['jobStatus_id'].eql?(4)|| SqlDbHelper.get_jobs.last['jobStatus_id'].eql?(5)}
        page.attach_file('csvPupilCensusFile', File.expand_path("#{File.dirname(__FILE__)}/../../../data/fixtures/#{filename}"))
      rescue
        raise "Last pupil census status stuck with Status_id: #{SqlDbHelper.get_jobs.last['jobStatus_id']}"
      end
    else
      page.attach_file('csvPupilCensusFile', File.expand_path("#{File.dirname(__FILE__)}/../../../data/fixtures/#{filename}"))
    end
  end



end

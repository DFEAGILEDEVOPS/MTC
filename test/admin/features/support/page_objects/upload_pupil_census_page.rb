class UploadPupilCensusPage < SitePrism::Page
  set_url '/service-manager/upload-pupil-census'

  element :heading, '.heading-xlarge', text: 'Upload pupil census'
  element :file_upload, '#file-upload'
  element :upload, '#upload-form-submit'
  element :cancel, 'a[href="/service-manager/home"]'
  element :uploaded_title, '.bold-small'


  section :uploaded_file, 'dl.pupil-census-uploaded-file' do
    element :file, 'dd:nth-of-type(1)'
    element :status, 'dd:nth-of-type(2)'
    element :remove, 'dd:nth-of-type(3) a'
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

end

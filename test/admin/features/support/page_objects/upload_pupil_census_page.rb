class UploadPupilCensusPage < SitePrism::Page
  set_url '/service-manager/upload-pupil-census'

  element :heading, '.heading-xlarge', text: 'Upload pupil census'
  element :file_upload, '#file-upload'
  element :upload, '#upload-form-submit'
  element :cancel, 'a[href="/service-manager/home"]'
  element :uploaded_title, '.bold-small'
  section :uploaded_file, 'dl.pupil-census-uploaded-file' do
    element :file, 'dd'
  end

  def create_unique_check_csv(file_name, file_contents)
    out_file = File.new(file_name, "w")
    out_file.puts(file_contents)
    out_file.close
  end

end

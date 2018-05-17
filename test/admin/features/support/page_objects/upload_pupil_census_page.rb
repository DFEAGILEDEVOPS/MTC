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
end

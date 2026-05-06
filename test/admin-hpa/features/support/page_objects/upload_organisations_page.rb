class UploadOrganisationsPage < SitePrism::Page
  set_url '/service-manager/organisations/upload'

  element :heading, '.govuk-heading-xl', text: 'Bulk upload organisations'
  element :choose_file, '#file-upload'
  element :upload, '#upload-form-submit'
  element :cancel, 'a', text: 'Cancel'
  element :completed, 'strong', text: 'Completed'
  element :failed, 'strong', text: 'Failed'
  element :error, '.govuk-warning-message'
  element :download_job_output, 'a', text: 'Download job output'

  def upload_schools(school_csv)
    page.attach_file('file-upload', school_csv)
  end

  def extract_zip(file, destination)
    FileUtils.mkdir_p(destination)

    Zip::File.open(file) do |zip_file|
      zip_file.each do |f|
        fpath = File.join(destination, f.name)
        zip_file.extract(f, fpath) unless File.exist?(fpath)
      end
    end
  end

  def extract_job_output(file_path, destination)
    extract_zip(file_path,
                destination)
    {output: File.read(destination+"/output.txt").split("\n"), error: File.read(destination+"/error.txt").split("\n") }
  end

end

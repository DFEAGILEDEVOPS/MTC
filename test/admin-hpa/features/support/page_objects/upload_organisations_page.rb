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
    resolved_destination = File.expand_path(destination.to_s)
    if resolved_destination.scan('/home/').size > 1
      resolved_destination = resolved_destination[resolved_destination.rindex('/home/')..]
    end

    FileUtils.mkdir_p(resolved_destination)

    Zip::File.open(file) do |zip_file|
      zip_file.each do |f|
        # Some archives may contain path-like entry names; keep only filename to avoid invalid nested absolute paths
        entry_name = File.basename(f.name.to_s)
        fpath = File.join(resolved_destination, entry_name)
        next if File.exist?(fpath)

        File.open(fpath, 'wb') do |file_handle|
          file_handle.write(f.get_input_stream.read)
        end
      end
    end

    resolved_destination
  end

  def extract_job_output(file_path, destination)
    resolved_destination = extract_zip(file_path,
                                       destination)
    {
      output: File.read(File.join(resolved_destination, 'output.txt')).split("\n"),
      error: File.read(File.join(resolved_destination, 'error.txt')).split("\n")
    }
  end

end

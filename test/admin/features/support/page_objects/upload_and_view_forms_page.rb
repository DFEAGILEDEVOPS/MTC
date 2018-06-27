class UploadAndViewFormsPage < SitePrism::Page
  set_url '/test-developer/upload-and-view-forms'

  element :heading, '.heading-xlarge', text: 'Upload and view forms'
  element :new_form_heading, '.heading-xlarge', text: 'Upload new form'
  elements :new_form_sub_heading, '.heading-medium'
  elements :new_form_info_message, '.numeric-list li'
  element :download_form_example_template, '.numeric-list a', text: 'Download the example'
  element :chose_file, '#file-upload'
  element :upload, 'input[value="Upload"]'
  element :back, 'a.button-secondary'
  element :remove_upload, 'input[value="Remove files"]'
  element :error_message, '.error-message', text: 'A valid CSV file was not uploaded'
  element :check_form_title_column_heading, '#checkFormsList thead tr th:nth-child(1) a'
  element :back_to_home, '.breadcrumbs a[href="/"]'
  element :csrf, 'input[name="_csrf"]', visible: false

  element :upload_form_message, '#lead-paragraph', text: 'View, upload or remove check forms.'
  element :upload_new_form, 'a', text: 'Upload new form'
  section :phase_banner, PhaseBanner, '.phase-banner'

  element :info_message, '.info-message'

  section :available_checks, '#checkFormsList' do
    sections :rows, 'tbody tr' do
      element :title, 'td:nth-child(1) a:last-of-type'
      element :assigned_to, 'td:nth-of-type(2)'
      element :uploaded_date, 'td:nth-of-type(3)'
      element :remove_form, 'a', text: 'Remove'
      element :highlighted_row, '.highlight-item'
    end
  end

  section :modal, '.modal-box.show' do
    element :heading, '#modal-title'
    element :content, '.modal-content p'
    element :cancel, '.modal-cancel'
    element :confirm, '.modal-confirm'
  end

  section :errors, '.error-summary' do
    element :title, 'h2.error-summary-heading'
    element :criteria_intro, 'p', text: 'The form upload spreadsheet:'
    element :csv_format_error, 'li', text: 'must be in CSV format'
    element :two_column_error, 'li', text: 'must only contain 2 columns'
    element :no_header_error, 'li', text: 'must not have a header row'
    element :number_range_error, 'li', text: 'must only contain numbers between 1 and 12'
    element :retry_upload, 'a[href="#file-upload"]', text: 'Please try uploading a file again'
  end

  def create_unique_check_csv(file_name, file_contents)
    out_file = File.new(file_name, "w")
    out_file.puts(file_contents)
    out_file.close
  end

  def delete_csv_file(file_name)
    File.delete(file_name)
  end

end
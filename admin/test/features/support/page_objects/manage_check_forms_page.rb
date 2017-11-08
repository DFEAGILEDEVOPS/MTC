class ManageCheckFormsPage < SitePrism::Page
  set_url '/test-developer/manage-check-forms'

  element :heading, '.heading-xlarge', text: 'Manage check forms'
  element :choose_file, '#file-upload'
  element :remove_upload, 'input[value="Remove"]'
  element :upload, 'input[value="Upload file"]'
  element :assign, 'input[value="Assign"]'
  element :error_message, '.error-message', text: 'A valid CSV file was not uploaded'
  section :phase_banner, PhaseBanner, '.phase-banner'

  section :available_checks, 'form .group' do
    sections :rows, 'tbody tr' do
      element :checkbox, 'td:nth-of-type(1) .multiple-choice input'
      element :title, 'td:nth-of-type(1) .multiple-choice label a'
      element :assigned_to, 'td:nth-of-type(2)'
      element :uploaded_date, 'td:nth-of-type(3)'
    end
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

end

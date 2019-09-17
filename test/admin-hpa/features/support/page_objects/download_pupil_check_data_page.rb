class DownloadPupilCheckDataPage < SitePrism::Page
  set_url '/test-developer/download-pupil-check-data'

  element :heading, '.govuk-heading-xl', text: 'Download pupil check data'
  element :information, '.govuk-body', text: 'Generate and download the raw pupil check data, including timings, responses and keystrokes, and an anomaly report.'
  element :generate_latest_files_button, '#generate-check-data-button'
  element :error_message, '#error-summary-heading-1', text: 'There was an error when generating the latest file'

end

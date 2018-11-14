class DownloadPupilCheckDataPage < SitePrism::Page
  set_url '/test-developer/download-pupil-check-data'

  element :heading, '.heading-xlarge', text: 'Download pupil check data'
  element :information, '#lead-paragraph', text: 'Generate a zip file with the most up to date pupil check data. The zip file will contain two csv files. One with the raw pupil check data including timings, responses and keystrokes. Another will contain an anomaly report'
  element :generate_latest_files_button, '#generate-check-data-button'
  element :error_message, '#error-summary-heading-1', text: 'There was an error when generating the latest file'

end
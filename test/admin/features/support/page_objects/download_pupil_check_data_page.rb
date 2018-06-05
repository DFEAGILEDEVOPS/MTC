class DownloadPupilCheckDataPage < SitePrism::Page
  set_url '/test-developer/download-pupil-check-data'

  element :heading, '.heading-xlarge', text: 'Download pupil check data'
  element :information, '#lead-paragraph', text: 'Generate and download the latest file which contains a detailed record of the raw pupil check data such as timings, responses and key strokes.'

end
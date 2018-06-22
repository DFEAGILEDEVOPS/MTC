class PhaseBanner < SitePrism::Section

  element :phase, '.phase-tag'
  section :feedback, 'span' do
    element :link, 'a[href="https://www.smartsurvey.co.uk/s/MTCTrial3SchoolSurvey/"]'
  end

end
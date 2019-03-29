class PhaseBanner < SitePrism::Section

  element :phase, '.phase-tag'
  section :feedback, 'span' do
    element :link, 'a[href="https://www.smartsurvey.co.uk/s/MTC_survey_2019/"]'
  end

end

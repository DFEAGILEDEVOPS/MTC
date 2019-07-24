class PhaseBanner < SitePrism::Section

  element :phase, '.phase-tag'
  element :phase_v2, '.govuk-tag'
  section :feedback, 'span' do
    element :link, 'a[href="https://www.smartsurvey.co.uk/s/MTC_survey_2019/"]'
  end

end

class PhaseBanner < SitePrism::Section

  element :phase, '.phase-tag'
  section :feedback, 'span' do
    element :link, 'a[href="https://www.smartsurvey.co.uk/s/MTC_admin_survey/"]'
  end

end

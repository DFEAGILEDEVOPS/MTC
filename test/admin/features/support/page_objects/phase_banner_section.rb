class PhaseBanner < SitePrism::Section

  element :phase, '.phase-tag'
  section :feedback, 'span' do
    element :link, 'a[href="http://www.smartsurvey.co.uk/s/mtc-trial-june-2017/"]'
  end

end
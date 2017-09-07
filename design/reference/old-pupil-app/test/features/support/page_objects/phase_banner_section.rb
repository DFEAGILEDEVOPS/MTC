class PhaseBanner < SitePrism::Section

  element :phase, '.phase-tag'
  section :feedback, 'span' do
    element :link, 'a[href="/check/feedback"]'
  end

end
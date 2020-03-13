class PhaseBanner < SitePrism::Section

  element :phase, '.phase-tag'
  element :phase_v2, '.govuk-tag'
  section :feedback, 'span' do
    element :link, 'a[href="https://dferesearch.fra1.qualtrics.com/jfe/form/SV_b9M6bg3TxSbITbf"]'
  end

end

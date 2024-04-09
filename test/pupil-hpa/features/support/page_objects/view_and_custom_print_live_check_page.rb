class ViewAndCustomPrintLiveCheckPage < SitePrism::Page

  set_url "pupil-pin/view-and-custom-print-live-pins"

  element :generate_more_pin_btn, 'a', text: "Generate PINs"
  element :csrf, 'input[name="_csrf"]', visible: false

  element :heading, '.govuk-heading-xl'
  element :generate_pin_message, '.govuk-body'

  element :closed_filter, '.filter-label.hidden', text: 'Filter by groups'
  element :opened_filter, '.filter-label', text: 'Filter by groups'
  sections :groups, '#filterByGroup li' do
    element :checkbox, '.pupils-not-taking-the-check'
    element :name, 'label[class*="font-size-16"]'
    element :count, '.group-count'
  end

  element :select_all_pupils, '#tickAllCheckboxes'
  element :deselct_all_pupil, '#tickAllCheckboxes', text: 'Deselect all'
  section :pupil_list, '#generatePins tbody' do
    sections :rows, 'tr' do
      element :checkbox, 'input[type="checkbox"]'
      element :selected, 'input[data-checked="true"]'
      element :name, '#pupilName'
      element :school_pwd_label, '.pin-content span:nth-child(1)'
      element :school_password, '.pin-content span:nth-child(2)'
      element :pin_label, '.pin-content span:nth-child(4)'
      element :pin, '.pin-content span:nth-child(5)'
      element :group, 'td:nth-child(3)'
    end
  end

  section :sticky_banner, StickyBannerSection, '.govuk-sticky-banner-wrapper'

  def find_pupil_row(name)
    wait_until {!(pupil_list.rows.find {|pupil| pupil.text.include? name}).nil?}
    pupil_list.rows.find {|pupil| pupil.text.include? name}
  end

end

class CustomPinsFamiliarisationPage < SitePrism::Page
  set_url '/pupil-pin/view-and-custom-print-familiarisation-pins'

  element :heading, '.heading-xlarge'
  element :pin_message, '.lede', text: 'Personal identification number (PIN) have been generated for pupils. This list contains all active PINs. These expire at 4pm daily.'
  element :filter_by_name, '#search-name'
  section :group_filter, GroupFilter, '#filterByGroup'

  element :select_all_pupils, '#tickAllCheckboxes'
  element :deselct_all_pupil, '#tickAllCheckboxes', text: 'Deselect all'

  section :pupil_list, '#generatePins tbody' do
    sections :rows, 'tr' do
      element :name, 'label strong'
      element :school_pwd_label, '.pin-content span:nth-child(1)'
      element :school_password, '.pin-content span:nth-child(2)'
      element :pin_label, '.pin-content span:nth-child(4)'
      element :pin, '.pin-content span:nth-child(5)'
      element :checkbox, '.multiple-choice-mtc'
    end
  end

  section :sticky_banner, StickyBannerSection, '.sticky-banner-wrapper'

  def find_pupil_row(name)
    wait_until {!(pupil_list.rows.find {|pupil| pupil.text.include? name}).nil?}
    pupil_list.rows.find {|pupil| pupil.text.include? name}
  end

end
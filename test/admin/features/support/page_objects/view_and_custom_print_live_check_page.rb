class ViewAndCustomPrintLiveCheckPage < SitePrism::Page

  set_url "pupil-pin/view-and-custom-print-live-pins?"

  element :heading, '.heading-xlarge'
  element :generate_pin_message, '.lede', text: 'Personal identification number (PIN) have been generated for pupils. This list contains all active PINs. These expire at 4pm daily.'

  section :group_filter, GroupFilter, '.column-two-thirds'

  element :select_all_pupils, '#tickAllCheckboxes'
  element :deselct_all_pupil, '#tickAllCheckboxes', text: 'Deselect all'
  section :pupil_list, '#generatePins tbody' do
    sections :rows, 'tr' do
      element :checkbox, 'input[type="checkbox"]'
      element :selected, 'input[data-checked="true"]'
      element :name, 'label strong'
      element :school_pwd_label, '.pin-content span:nth-child(1)'
      element :school_password, '.pin-content span:nth-child(2)'
      element :pin_label, '.pin-content span:nth-child(4)'
      element :pin, '.pin-content span:nth-child(5)'
    end
  end

  section :sticky_banner, StickyBannerSection, '.sticky-banner-wrapper'
end
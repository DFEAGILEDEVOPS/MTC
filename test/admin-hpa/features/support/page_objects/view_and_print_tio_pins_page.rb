class ViewAndPrintTioPinsPage < SitePrism::Page
  set_url '/pupil-pin/view-and-custom-print-familiarisation-pins'

  element :heading, '.govuk-heading-xl'
  element :pin_message, '.govuk-body'
  element :filter_by_name, '#search-name'

  element :pins_for_fam_check_breadcrumb, 'a[href="/pupil-pin/generate-familiarisation-pins-overview"]', text: 'Generate passwords and PINs for the try it out check'

  section :group_filter, GroupFilter, '#filterByGroup'

  element :select_all_pupils, '#tickAllCheckboxes'
  element :deselct_all_pupil, '#tickAllCheckboxes', text: 'Deselect all'

  section :pupil_list, '#generatePins tbody' do
    sections :rows, 'tr' do
      element :name, '#pupilName'
      element :school_pwd_label, '.pin-content span:nth-child(1)'
      element :school_password, '.pin-content span:nth-child(2)'
      element :pin_label, '.pin-content span:nth-child(4)'
      element :pin, '.pin-content span:nth-child(5)'
      element :checkbox, '.multiple-choice-mtc'
      element :group, 'td:nth-child(2)'
    end
  end

  section :sticky_banner, StickyBannerSection, '.govuk-sticky-banner-wrapper'

  def find_pupil_row(name)
    wait_until {!(pupil_list.rows.find {|pupil| pupil.text.include? name}).nil?}
    pupil_list.rows.find {|pupil| pupil.text.include? name}
  end

end

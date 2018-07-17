class GeneratePinsFamiliarisationOverviewPage < SitePrism::Page
  set_url '/pupil-pin/generate-familiarisation-pins-overview'

  element :heading, '.heading-xlarge'
  element :generate_pin_message, '.lede', text: 'Pupils will need a personal identification number (PIN) and school password in order to start the check in the familiarisation area. These expire at 4pm daily.'
  element :access_arrangment_text, '.column-two-thirds', text: 'Select access arrangements for pupils who need it before generating PINs'
  element :access_arrangment_link, "a[href='/pupil-pin/access-arrangements']", text: 'access arrangements'
  element :generate_pin_btn, 'input[value="Generate PINs"]'
  element :generate_more_pin_btn, 'a', text: "Generate more PINs"

  section :instruction_section, 'details' do
    element :toggle, 'summary[role="button"]'
    elements :info_message, '.list-number li'
  end

  section :group_filter, GroupFilter, '.column-two-thirds'

  element :select_all_pupils, '#tickAllCheckboxes'
  element :deselct_all_pupil, '#tickAllCheckboxes', text: 'Deselect all'
  element :pupil_column_heading, '#generatePins thead tr a'
  section :pupil_list, '#generatePins tbody' do
    sections :rows, 'tr' do
      element :checkbox, 'input[type="checkbox"]'
      element :selected, 'input[data-checked="true"]'
      element :name, 'td:nth-child(1)'
      element :pin, 'td:nth-child(2)'
    end
  end

  section :sticky_banner, StickyBannerSection, '.sticky-banner-wrapper'

end
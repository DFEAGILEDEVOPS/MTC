class GeneratePinsFamiliarisationOverviewPage < SitePrism::Page
  set_url '/pupil-pin/generate-familiarisation-pins-overview'

  element :heading, '.govuk-heading-xl'
  element :generate_pin_message, 'p.govuk-body'
  element :access_arrangment_text, '.govuk-inset-text', text: 'Select access arrangements for pupils who need it before generating PINs'
  element :access_arrangment_link, "a[href='/access-arrangements/overview']", text: 'access arrangements'
  element :generate_pin_btn, 'input[value="Generate PINs"]'
  element :generate_more_pin_btn, 'a', text: "Generate additional PINs"
  element :view_all_pins_btn, 'input[value="View all pins"]'

  section :instruction_section, 'details' do
    element :toggle, 'summary[role="button"]'
    elements :info_message, '.govuk-list--number li'
  end

  section :generated_pin_overview, '#generatePins' do
    element :generated_pin_heading, 'tr', text: "Generated PINs"
    element :generated_pin_information, 'tbody tr td label', text: "PINs have been generated for"
    element :pin_expiry_info, '.govuk-font-greyed-out', text: "Expires 4pm today"
    element :view_all_pins_btn, 'input[value="View all pins"]'
    element :generate_additional_pins_btn, 'a', text: "Generate additional PINs"
  end

  section :group_filter, GroupFilter, '.govuk-grid-column-two-thirds'

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

  section :sticky_banner, StickyBannerSection, '.govuk-sticky-banner-wrapper'

  def generate_pin_using_name(name)
    pupil = find_pupil_row(name)
    name = pupil.name.text
    pupil.checkbox.click
    sticky_banner.confirm.click
    name
  end

  def generate_pin_for_multiple_pupils(number_of_pupils)
    pupils_with_no_pin = pupil_list.rows.select {|row| row.has_no_selected?}
    pupils_with_no_pin = pupils_with_no_pin.reject{|row| row.name.text.scan(/[a-zA-Z0-9]+/).join(" ") != row.name.text.delete(',')}
    pupil_array = pupils_with_no_pin[0..number_of_pupils.to_i]
    pupil_names = pupil_array.map {|pupil| pupil.name.text}
    pupil_array.each {|pupil| pupil.checkbox.click}
    sticky_banner.confirm.click
    pupil_names
  end


  def find_pupil_row(name)
    wait_until {!(pupil_list.rows.find {|pupil| pupil.text.include? name}).nil?}
    pupil_list.rows.find {|pupil| pupil.text.include? name}
  end


end

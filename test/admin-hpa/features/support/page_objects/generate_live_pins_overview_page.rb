class GenerateLivePinsOverviewPage < SitePrism::Page
  set_url '/pupil-pin/generate-live-pins-overview'

  element :heading, '.govuk-heading-xl'
  element :generate_pin_message, 'p.govuk-body'
  element :access_arrangment_text, '.govuk-inset-text', text: 'Enable access arrangements for pupils who need them before generating PINs.'
  element :access_arrangment_link, "a[href='/access-arrangements/overview']", text: 'access arrangements'

  section :instruction_section, 'details' do
    element :toggle, '.govuk-details__summary'
    elements :info_message, '.govuk-list--number li'
  end
  element :generate_pin_btn, 'input[value="Generate password and PINs for the official check"]'
  element :related_heading, ".govuk-heading-m", text: 'Related'
  element :guidance, "a", text: 'Read the guidance and watch videos'
  element :restarts, "a[href='/restart/overview']", text: 'Select pupils to restart the check'
  element :csrf, 'input[name="_csrf"]', visible: false

  section :group_filter, GroupFilter, '#main-content .govuk-grid-column-two-thirds'

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

  section :error_summary, 'div[aria-labelledby="error-summary-heading-1"]' do
    element :error_heading, '#error-summary-heading-1', text: 'Unable to proceed. Error: SM01. Please contact helpdesk'
    element :error_info, 'p', text: 'National curriculum assessments helpline'
  end

  section :generated_pin_overview, '#generatePins' do
    element :generated_pin_heading, 'tr', text: "Generated PINs"
    element :generated_pin_information, 'tbody tr td label', text: "Official check PINs generated for 1 pupil"
    element :pin_expiry_info, '.govuk-font-greyed-out', text: "Expires 4pm today"
    element :view_all_pins_btn, 'a', text: "View all pins"
    element :generate_additional_pins_btn, 'a', text: "Generate password and PINs for the official check"
  end

  def generate_pin_using_name(name)
    pupil = find_pupil_row(name)
    name = pupil.name.text
    pupil.checkbox.click
    sticky_banner.confirm.click
    name
  end

  def generate_pin_using_list_of_names(names_array)
    names_array.each do |name|
      pupil = find_pupil_row(name)
      name = pupil.name.text
      pupil.checkbox.click
    end
    sticky_banner.confirm.click
    names_array
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
    SafeTimeout.timeout(ENV['WAIT_TIME'].to_i){sleep 1; visit current_url until pupil_list.rows.find {|pupil| pupil.text.include? name}}
    pupil_list.rows.find {|pupil| pupil.text.include? name}
  end

  def generate_pins
    generate_pin_btn.click if has_generate_pin_btn?
    generated_pin_overview.generate_additional_pins_btn.click if generated_pin_overview.has_generate_additional_pins_btn?
  end

end

class GeneratePupilPinsPage < SitePrism::Page
  set_url '/school/generate-pins-overview'

  element :heading, '.heading-xlarge'
  element :generate_pin_message, '.column-two-thirds', text: 'Pupils will need a Personal Identification Number (PIN) and school password in order to start the check. These expire daily.'
  elements :info_message, '.list-number li'
  element :generate_pin_btn, 'input[value="Generate PINs"]'
  element :generate_more_pin_btn, 'input[value="Generate more PINs"]'
  element :school_password, '.column-two-thirds br'

  element :select_all_pupils, '#selectAll'
  element :unselect_all_pupils, '#selectAll'
  element :pupil_column_heading, '#generatePins thead tr a'
  section :pupil_list, '#generatePins tbody' do
    sections :rows, 'tr' do
      element :checkbox, 'input[type="checkbox"]'
      element :selected, 'input[data-checked="true"]'
      element :name, 'td:nth-child(1)'
      element :pin, 'td:nth-child(2)'
    end
  end

  section :sticky_banner, '.sticky-banner-wrapper' do
    element :count, '.grid-row .column-half.first-half'
    element :cancel, '#stickyCancel'
    element :confirm, '#stickyConfirm'
  end

  def generate_pin_using_name(name)
    pupil = find_pupil_row(name)
    name = pupil.name.text
    pupil.checkbox.click
    sticky_banner.confirm.click
    name
  end

    def generate_pin_for_multiple_pupils(number_of_pupils)
      pupils_with_no_pin = pupil_list.rows.select {|row| row.has_no_selected?}
      pupil_array = pupils_with_no_pin[0..number_of_pupils.to_i]
      pupil_names = pupil_array.map {|pupil| pupil.name.text }
      pupil_array.each {|pupil| pupil.checkbox.click}
      sticky_banner.confirm.click
      pupil_names
    end

  def find_pupil_row(name)
    wait_until{!(pupil_list.rows.find {|pupil| pupil.text.include? name}).nil?}
    pupil_list.rows.find {|pupil| pupil.text.include? name}
  end

end
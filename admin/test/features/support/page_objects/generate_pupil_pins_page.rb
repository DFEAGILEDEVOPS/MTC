class GeneratePupilPinsPage < SitePrism::Page
  set_url '/school/generate-pins-overview'

  element :heading, '.heading-xlarge'
  element :generate_pin_message, '.column-two-thirds', text: 'Pupils will need a Personal Identification Number (PIN) and school password in order to start the check. These expire daily.'
  elements :info_message, '.list-number li'
  element :generate_pin_btn, 'input[value="Generate PINs"]'

  element :select_all_pupils, '#selectAll'
  element :unselect_all_pupils, '#selectAll'
  element :pupil_column_heading, '#pupilsList thead tr a'
  section :pupil_list, '#pupilsList tbody' do
    sections :rows, 'tr' do
      element :checkbox, 'input[type="checkbox"]'
      element :selected, 'input[data-checked="true"]'
      element :name, 'label'
    end
  end


end
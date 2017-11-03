# class ManagePupilPage < SitePrism::Page
#   set_url '/school/manage-pupils'
#
#   element :heading, '.heading-xlarge', text: 'Manage pupils'
#   element :message, '.lede', text: 'Use this section to add and edit pupils and generate PINs for pupils'
#   element :add_pupil, 'a[href="/school/pupil/add"]'
#   section :phase_banner, PhaseBanner, '.phase-banner'
#
#   section :school_password_information, '.box-light-grey' do
#     element :password_date, '.font-small'
#     element :password, '.font-xxlarge'
#   end
#
#   element :generate_pins, 'input[value="Generate PIN(s)"]'
#   element :print_pins, '.pupils-print-pins'
#
#   section :pupil_list, '#pupilsList' do
#     element :tick_all, '#tickAllCheckboxes'
#     sections :pupil_row, 'tbody tr' do
#       element :names, 'td strong'
#       element :checkbox, '.pupils-list input'
#       element :edit_pupil_link, 'a'
#       element :dob, '.pupils-list span.font-xsmall'
#       element :no_pin, '.font-greyed-out'
#       element :pin, 'td:last-of-type span'
#     end
#   end
#
#   def generate_pin_for_a_pupil
#     pupil_with_no_pin = pupil_list.pupil_row.find {|pupil| pupil.text.include? 'n/a'}
#     pupil_name = pupil_with_no_pin.names.text
#     pupil_with_no_pin.checkbox.click
#     generate_pins.click
#     pupil_name
#   end
#
#   def generate_pin_for_multiple_pupils(number_of_pupils)
#     pupils_with_no_pin = pupil_list.pupil_row.select {|pupil| pupil.text.include? 'n/a'}
#     pupil_array = pupils_with_no_pin[0..number_of_pupils.to_i]
#     pupil_names = pupil_array.map {|pupil| pupil.names.text }
#     pupil_array.each {|pupil| pupil.checkbox.click}
#     generate_pins.click
#     pupil_names
#   end
#
# end
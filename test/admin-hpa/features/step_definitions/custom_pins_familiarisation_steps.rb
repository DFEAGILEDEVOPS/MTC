Given(/^I am on the familiarisation custom print page$/) do
  step 'I have generated a familiarisation pin for a pupil'
  view_and_print_pins_page.pins_for_fam_check_breadcrumb.click
  generate_pins_familiarisation_overview_page.view_all_pins_btn.click
end

Then(/^I should see the familiarisation custom print page matches design$/) do
  expect(custom_pins_familiarisation_page).to have_heading
  expect(custom_pins_familiarisation_page).to have_pin_message
  expect(custom_pins_familiarisation_page).to have_filter_by_name
  expect(custom_pins_familiarisation_page).to have_pupil_list
end

And(/^I have generated familiarisation pins for pupils without a group$/) do
  generate_pins_familiarisation_overview_page.load
  step 'I click Generate PINs button'
  @pupil_names_arr = generate_pins_familiarisation_overview_page.generate_pin_for_multiple_pupils(2)

  ct = Time.now
  new_time = Time.new(ct.year, ct.mon, ct.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  @pupil_names_arr.each do |pupil|
    pupil_lastname = pupil.split(',')[0]
    pupil_firstname = pupil.split(',')[1].split(' Date')[0].split(' ')[0]
    SqlDbHelper.set_pupil_pin_expiry(pupil_firstname, pupil_lastname, 2, new_time)
  end
  SqlDbHelper.set_school_pin_expiry('1001', new_time)
end

When(/^I navigate to the familiarisation custom print page$/) do
  custom_pins_familiarisation_page.load
end

Then(/^I should be able to filter and print the pupils in the group$/) do
  expect(custom_pins_familiarisation_page.pupil_list.rows.map {|a| a.name.text}.reject(&:empty?).size).to be > @pupil_group_array.size
  # custom_pins_familiarisation_page.group_filter.closed_filter.click unless custom_pins_familiarisation_page.group_filter.has_opened_filter?
  group = custom_pins_familiarisation_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
  expect(custom_pins_familiarisation_page.pupil_list.rows.map {|a| a.name.text}.reject(&:empty?).size).to eql @pupil_group_array.size
  custom_pins_familiarisation_page.select_all_pupils.click
  expect(custom_pins_familiarisation_page.sticky_banner).to have_confirm
end
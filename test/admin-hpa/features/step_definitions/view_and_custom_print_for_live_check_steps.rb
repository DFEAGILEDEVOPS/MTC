
Given(/^I am on view and custom print for live check page$/) do
  step "I have generated a pin for a pupil"
  step "I am on the generate pupil pins page"
  step "I click View all pins button"

  @page = view_and_custom_print_live_check_page
end

Then(/^view and custom print page is displayed as per design$/) do
  expect(view_and_custom_print_live_check_page).to have_heading
  expect(view_and_custom_print_live_check_page).to have_generate_pin_message
  expect(view_and_print_pins_page).to have_pupil_list
  expect(view_and_custom_print_live_check_page).to have_select_all_pupils
end

Then(/^I should be able to select them via a checkbox on Custom Print Live check page$/) do
  view_and_custom_print_live_check_page.pupil_list.rows.each {|pupil| expect(pupil).to have_checkbox}
end

When(/^I select a Pupil on Custom Print Live check page$/) do
  pupil = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.has_no_selected?}
  pupil.checkbox.click
end

When(/^I deselect all pupils on Custom Print Live check page$/) do
  view_and_custom_print_live_check_page.select_all_pupils.click
  expect(@page).to have_sticky_banner
  view_and_custom_print_live_check_page.select_all_pupils.click
end

When(/^I select multiple pupils on Custom Print Live check page$/) do
  @pupils = view_and_custom_print_live_check_page.pupil_list.rows.select {|row| row.has_no_selected?}
  @pupils[0..3].each {|pupil| pupil.checkbox.click}
  @pupil_names = @pupils[0..3].map {|pupil| pupil.name.text}
end

Given(/^I am on view and custom print for live check page with some pupil from the group$/) do
  step "I have generated pins for all pupils in a group"
  step "I am on the generate pupil pins page"
  step "I click View all pins button"
end

When(/^I choose to filter via group on Custom Print Live check page$/) do
  @page = view_and_custom_print_live_check_page
  view_and_custom_print_live_check_page.closed_filter.click unless view_and_custom_print_live_check_page.has_opened_filter?
  group = view_and_custom_print_live_check_page.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
end

Then(/^I should only see pupils on Custom Print Live check page$/) do
  filtered_pupils = view_and_custom_print_live_check_page.pupil_list.rows.map {|row| row.name.text.split('Date').first}.compact.map {|pupil| pupil.strip}
  expect(filtered_pupils.count).to eql @pupil_group_array.count
end

And(/^I should be able to see a count of pupils on Custom Print Live check page$/) do
  group = view_and_custom_print_live_check_page.groups.find {|group| group.name.text.include? @group_name}
  expect(group.count.text.scan(/\d/).join('').to_i).to eql @pupil_group_array.size
end

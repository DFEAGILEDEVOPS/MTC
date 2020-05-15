And(/^I am on the assign check window v2 page$/) do
  testdeveloper_landing_page.assign_forms_to_check_windows.click
end

Then(/^I should see assign check window v2 page as per design$/) do
  expect(assign_form_to_window_v2_page).to have_heading
  expect(assign_form_to_window_v2_page).to have_information
  assign_form_to_window_v2_page.check_windows.rows.each do |row|
    expect(row).to have_name_of_window
    expect(row).to have_try_it_out_check_link
    expect(row).to have_try_it_out_check_date
    expect(row).to have_mtc_check_link
    expect(row).to have_mtc_check_date
    mtc_check_date = row.mtc_check_date.text
    try_it_out_check_date = row.try_it_out_check_date.text
    window_name = row.name_of_window.text
    fam_start_date = SqlDbHelper.check_window_details(window_name)['familiarisationCheckStartDate'].strftime("%-d %B %Y")
    fam_end_date = SqlDbHelper.check_window_details(window_name)['familiarisationCheckEndDate']
    fam_end_date = fam_end_date.utc_offset > 0 ? fam_end_date.in_time_zone(-1).strftime("%-d %B %Y") : fam_end_date.strftime("%-d %B %Y")
    check_start_date = SqlDbHelper.check_window_details(window_name)['checkStartDate'].strftime("%-d %B %Y")
    check_end_date = SqlDbHelper.check_window_details(window_name)['familiarisationCheckEndDate']
    check_end_date = check_end_date.utc_offset > 0 ? check_end_date.in_time_zone(-1).strftime("%-d %B %Y") : check_end_date.strftime("%-d %B %Y")
    expect(mtc_check_date).to eql check_start_date + ' to ' + check_end_date
    expect(try_it_out_check_date).to eql fam_start_date + ' to ' + fam_end_date
  end
end


Then(/^I can assign live check forms to inactive window$/) do
  window = assign_form_to_window_v2_page.check_windows.rows.find {|row| row.name_of_window.text == @check_window_hash[:check_name]}
  window.mtc_check_link.click
  form = select_form_to_assign_page.check_forms.rows.find {|row| row.name_of_form.text == @file_name.split('.').first}
  form.select.click
  expect(select_form_to_assign_page.sticky_banner.selected_count.text).to eql '1'
  select_form_to_assign_page.sticky_banner.confirm.click
  window = assign_form_to_window_v2_page.check_windows.rows.find {|row| row.name_of_window.text == @check_window_hash[:check_name]}
  expect(window.mtc_check_link_text.text).to include '(1 form assigned)'
  expect(window.try_it_out_check_link_text.text).to include '(0 forms assigned)'
  expect(assign_form_to_window_v2_page.flash_message.text).to eql "1 form has been assigned to #{@check_window_hash[:check_name]}, MTC"
end


Then(/^I can assign familiarisation check forms to inactive window$/) do
  window = assign_form_to_window_v2_page.check_windows.rows.find {|row| row.name_of_window.text == @check_window_hash[:check_name]}
  window.try_it_out_check_link.click
  form = select_form_to_assign_page.check_forms.rows.find {|row| row.name_of_form.text == @file_name.split('.').first}
  form.select.click
  assign_form_to_window_v2_page.save_button.click
  window = assign_form_to_window_v2_page.check_windows.rows.find {|row| row.name_of_window.text == @check_window_hash[:check_name]}
  expect(window.try_it_out_check_link_text.text).to include '(1 form assigned)'
  expect(window.mtc_check_link_text.text).to include '(0 forms assigned)'
  expect(assign_form_to_window_v2_page.flash_message.text).to eql "1 form has been assigned to #{@check_window_hash[:check_name]}, Try it out"
end

When(/^I attempt to assign a live form to a active check window$/) do
  window = assign_form_to_window_v2_page.check_windows.rows.find {|row| row.name_of_window.text == 'Development Phase'}
  window.mtc_check_link.click
end

Then(/^I should not be allowed to do so$/) do
  select_form_to_assign_page.check_forms.rows.each {|row| expect(row.has_no_select?).to be_truthy}
end

And(/^form assigned to '(.*)' check window display 'yes'$/) do |window_name|
  case window_name
  when 'Try it out'
    form_name = 'MTC0103'
  when 'Live check'
    form_name = 'MTC0100'
  end
  select_form_to_assign_page.check_forms.rows.each do |row|
    if row.name_of_form.text.eql?(form_name)
      expect(row.assigned.text.eql?('Yes')).to be_truthy, "Expected: 'Yes' .. But got #{row.assigned.text}"
    else
      expect(row.assigned.text.eql?('Yes')).to be_falsy, "Expected: '' .. But got #{row.assigned.text}"
    end
  end
end

When(/^I attempt to assign a familiarisation form to a active check window$/) do
  window = assign_form_to_window_v2_page.check_windows.rows.find {|row| row.name_of_window.text == 'Development Phase'}
  window.try_it_out_check_link.click
end


When(/^I attempt to assign a live form to a inactive check window$/) do
  window = assign_form_to_window_v2_page.check_windows.rows.find {|row| row.name_of_window.text == @check_window_hash[:check_name]}
  window.mtc_check_link.click
  form = select_form_to_assign_page.check_forms.rows.find {|row| row.name_of_form.text == @file_name.split('.').first}
  form.select.click
  expect(select_form_to_assign_page.sticky_banner.selected_count.text).to eql '1'
end

But(/^decide to cancel assigning$/) do
  assign_form_to_window_v2_page.cancel_button.click
end

When(/^I attempt to assign a familiarisation form to a inactive check window$/) do
  window = assign_form_to_window_v2_page.check_windows.rows.find {|row| row.name_of_window.text == @check_window_hash[:check_name]}
  window.try_it_out_check_link.click
  form = select_form_to_assign_page.check_forms.rows.find {|row| row.name_of_form.text == @file_name.split('.').first}
  form.select.click
end

Then(/^I should be taken back to the assign check window v2 page$/) do
  expect(assign_form_to_window_v2_page).to be_displayed
end

Then(/^I should not be able to remove the live check form$/) do
  upload_and_view_forms_v2_page.load
  assigned_form = upload_and_view_forms_v2_page.form_list.rows.find {|row| row.name.text == @file_name.split('.').first}
  expect(assigned_form).to_not have_remove
end

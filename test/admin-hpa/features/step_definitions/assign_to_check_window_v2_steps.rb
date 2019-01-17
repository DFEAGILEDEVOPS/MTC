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
    fam_end_date = SqlDbHelper.check_window_details(window_name)['familiarisationCheckEndDate'].strftime("%-d %B %Y")
    check_start_date = SqlDbHelper.check_window_details(window_name)['checkStartDate'].strftime("%-d %B %Y")
    check_end_date = SqlDbHelper.check_window_details(window_name)['checkEndDate'].strftime("%-d %B %Y")
    expect(mtc_check_date).to eql check_start_date + ' to ' + check_end_date
    expect(try_it_out_check_date).to eql fam_start_date + ' to ' + fam_end_date
  end
end

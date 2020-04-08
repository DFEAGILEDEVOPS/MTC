When(/^I select the view pin usage link$/) do
  school_landing_page.helpdesk_tools.summary.click
end


Then(/^I should be take to the view pin usage page$/) do
  expect(school_summary_page).to be_displayed
  expect(school_summary_page.heading.text).to eql 'Usage Summary for Example School One [9991001]'
  expect(school_summary_page.pupil_register_summary).to be_all_there
  expect(school_summary_page.live_checks).to be_all_there
  expect(school_summary_page.tio_checks).to be_all_there
end


Given(/^I am on the school landing page for school (\d+)$/) do |dfe_number|
  step 'I have signed in with helpdesk'
  step "I enter and submit a valid #{dfe_number} for impersonation"
end


Then(/^the data displayed in the pupil register summary table for (\d+) should be correct$/) do |dfe_number|
  step 'I am on the Pupil Status page'
  pupil_count = pupil_status_page.completed_checks.total.text.scan(/\d/).join('')
  completed_checks = pupil_status_page.completed_checks.count.text
  not_taking_checks = pupil_status_page.not_taking_checks.count.text
  school_summary_page.load
  expect(completed_checks).to eql school_summary_page.pupil_register_summary.rows.first.completed.text
  expect(not_taking_checks).to eql school_summary_page.pupil_register_summary.rows.first.not_taking.text
  expect(pupil_count.scan(/\d/).join('')).to eql school_summary_page.pupil_register_summary.rows.first.total.text
end


Then(/^the data displayed in the live check summary table for (\d+) should be correct$/) do |dfe_number|
  school_summary_page.load
  school_id = SqlDbHelper.find_school_by_dfeNumber(dfe_number)['id']
  check_dates = SqlDbHelper.get_all_checks_from_school(school_id).map {|check| check['createdAt'].strftime("%d %b %Y")}
  school_summary_page.live_checks.rows.each do |row|
    expect(check_dates).to include row.date.text
    check_dates.delete(row.date.text)
    expect(row.pins_generated.text.to_i).to eql SqlDbHelper.checks_created_at((Date.parse(row.date.text).strftime("%Y-%m-%d")),school_id).size
    expect(row.users_logged_in.text.to_i).to eql SqlDbHelper.count_logins_per_date((Date.parse(row.date.text).strftime("%Y-%m-%d")),school_id)
  end
end


Then(/^the data displayed in the tio check summary table for (\d+) should be correct$/) do |dfe_number|
  school_summary_page.load
  school_id = SqlDbHelper.find_school_by_dfeNumber(dfe_number)['id']
  check_dates = SqlDbHelper.get_all_checks_from_school(school_id).map {|check| check['createdAt'].strftime("%d %b %Y")}
  school_summary_page.tio_checks.rows.each do |row|
    expect(check_dates).to include row.date.text
    check_dates.delete(row.date.text)
    expect(row.pins_generated.text.to_i).to eql SqlDbHelper.checks_created_at((Date.parse(row.date.text).strftime("%Y-%m-%d")),school_id).select{|check| check['isLiveCheck'] == false}.size
  end
end

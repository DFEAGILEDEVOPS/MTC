When(/^I select the view pin usage link$/) do
  school_landing_page.helpdesk_tools.summary.click
end


Then(/^I should be take to the view pin usage page$/) do
  expect(school_summary_page).to be_displayed
  expect(school_summary_page.heading.text).to eql 'Usage Summary for Example School One [2011001]'
  expect(school_summary_page.pupil_register_summary).to be_all_there
  expect(school_summary_page).to have_live_checks
  expect(school_summary_page).to have_tio_checks
end


Given(/^I am on the school landing page for school (\d+)$/) do |dfe_number|
  step 'I have signed in with helpdesk'
  step "I enter and submit a valid #{dfe_number} for impersonation"
end


Then(/^the data displayed in the pupil register summary table for (\d+) should be correct$/) do |dfe_number|
  step 'I am on the Pupil Status page'
  pupil_count = pupil_status_page.pupils_completed.total.text.scan(/\d/).join('')
  school_summary_page.load
  expect(pupil_count.scan(/\d/).join('')).to eql school_summary_page.pupil_register_summary.rows.first.total.text
end


Then(/^the data displayed in the live check summary table for (\d+) should be correct$/) do |dfe_number|
  school_summary_page.load
  school_id = SqlDbHelper.find_school_by_dfeNumber(dfe_number)['id']
  check_dates = SqlDbHelper.get_all_checks_from_school(school_id).map {|check| check['createdAt'].strftime("%d %b %Y")}
  school_summary_page.live_checks.rows.each do |row|
    expect(check_dates).to include row.date.text
    check_dates.delete(row.date.text)
    expect(row.pins_generated.text.to_i).to eql SqlDbHelper.live_checks_created_at((Date.parse(row.date.text).strftime("%Y-%m-%d")), school_id).size
    expect(row.users_logged_in.text.to_i).to eql SqlDbHelper.count_live_logins_per_date((Date.parse(row.date.text).strftime("%Y-%m-%d")), school_id)
  end
end

Then(/^the data displayed in the tio check summary table for (\d+) should be correct$/) do |dfe_number|
  school_summary_page.load
  school_id = SqlDbHelper.find_school_by_dfeNumber(dfe_number)['id']
  check_dates = SqlDbHelper.get_all_checks_from_school(school_id).map {|check| check['createdAt'].strftime("%d %b %Y")}
  school_summary_page.tio_checks.rows.each do |row|
    expect(check_dates).to include row.date.text
    check_dates.delete(row.date.text)
    expect(row.pins_generated.text.to_i).to eql SqlDbHelper.tio_checks_created_at((Date.parse(row.date.text).strftime("%Y-%m-%d")), school_id).select{|check| check['isLiveCheck'] == false}.size
    expect(row.users_logged_in.text.to_i).to eql SqlDbHelper.count_tio_logins_per_date((Date.parse(row.date.text).strftime("%Y-%m-%d")), school_id)
  end
end


Then(/^the school password should be masked$/) do
  expect(view_and_print_live_pins_page.pupil_list.rows.first.school_password.text).to eql '****'
end


When(/^I generate a live pin for a pupil$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"
  navigate_to_pupil_list_for_pin_gen('live')
  @pupil_forename = name
  @page = generate_live_pins_overview_page
  @pupil_name = generate_live_pins_overview_page.generate_pin_using_name(name)
  pupil_pin_row = view_and_print_live_pins_page.pupil_list.rows.find {|row| row.name.text == @pupil_name}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
end


Given(/^I am on the school landing page for a school$/) do
  step 'I have signed in with helpdesk'
  step "I enter and submit a valid #{@school['dfeNumber']} for impersonation"
end


When(/^I generate a tio pin for a pupil$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"
  navigate_to_pupil_list_for_pin_gen('tio')
  @page = generate_tio_pins_overview_page
  @pupil_name = generate_tio_pins_overview_page.generate_pin_using_name(name)
end


But(/^the pupil pin should be visible$/) do
  expect(view_and_print_live_pins_page.pupil_list.rows.first.pin.text.to_i).to be > 0
end


Given(/^I am on the school landing page for a school using an account with the (sta admin|helpdesk) role$/) do |role|
  case role
  when "sta admin"
    step 'I have signed in with sta-admin'
  when "helpdesk"
    step "I have signed in with helpdesk"
  else
    fail role + " role not found "
  end
  p @school['dfeNumber']
  step "I enter and submit a valid #{@school['dfeNumber']} for impersonation"
end

Then(/^the school password should be unmasked$/) do
  expect(view_and_print_live_pins_page.pupil_list.rows.first.school_password.text).to eql SqlDbHelper.find_school(@school_id)['pin']
end

Then(/^I should see the helpdesk impersonation is audited$/) do
  user_id = SqlDbHelper.find_teacher(@teacher)['id']
  audit_record = SqlDbHelper.get_school_impersonation_audit(user_id,@school['id'])
  expect(audit_record).to_not be_nil
end

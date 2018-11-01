
Given(/I am logged with familiarisation pin/) do
  sign_in_page.load
  ct = Time.now
  new_time = Time.new(ct.year, ct.mon, ct.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  @pupil = SqlDbHelper.find_next_pupil
  @pin = 4.times.map {rand(2..9)}.join
  SqlDbHelper.reset_pin(@pupil['foreName'], @pupil['lastName'], @pupil['school_id'], new_time, @pin)
  current_time = Time.now + 86400
  new_time = Time.new(current_time.year, current_time.mon, current_time.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  SqlDbHelper.set_pupil_pin_expiry(@pupil['foreName'], @pupil['lastName'], @pupil['school_id'], new_time)
  SqlDbHelper.create_check(new_time, new_time, @pupil['id'], false)
  SqlDbHelper.set_school_pin(@pupil['school_id'], new_time, 'abc35def')

  @school = SqlDbHelper.find_school(@pupil['school_id'])

  sign_in_page.login(@school['pin'], @pin)
  sign_in_page.sign_in_button.click
end

Given(/^I am on the familiarisation complete page$/) do
  step 'I am logged with familiarisation pin'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the keyboard"
  warm_up_complete_page.start_check.click
  mtc_check_start_page.start_now.click

  step 'I should be able to use the on screen keyboard to complete the test'
end

Given(/^I am on the warm up intro page for familiarisation check$/) do
  step "I am logged with familiarisation pin"
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
end

Given(/^I am on the instructions page for familiarisation check$/) do
  step 'I am logged with familiarisation pin'
  confirmation_page.read_instructions.click
end

Then(/^I can see familiarisation header section$/) do
  expect(confirmation_page).to have_familiarisation_header
end

And(/^I click start again link$/) do
  complete_page.start_again.click
end

Then(/^I am on the what to expect page$/) do
  expect(start_page).to be_displayed
end

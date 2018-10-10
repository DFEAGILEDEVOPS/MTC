Given(/^I am on the sign in page$/) do
  sign_in_page.load
end

Then(/^I should see a global header$/) do
  expect(sign_in_page).to have_global_header
end

Then(/^I should see a feedback text on the page$/) do
  expect(sign_in_page.phase_banner).to have_feedback
end

Then(/^I should see a footer with a link to crown copyright$/) do
  expect(sign_in_page).to have_footer_link
end

Given(/^I have logged in$/) do
  sign_in_page.load
  ct = Time.now
  new_time = Time.new(ct.year, ct.mon, ct.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  @pupil = SqlDbHelper.find_next_pupil
  @pin = 4.times.map {rand(2..9)}.join
  SqlDbHelper.reset_pin(@pupil['foreName'], @pupil['lastName'], @pupil['school_id'], new_time, @pin)
  current_time = Time.now + 86400
  new_time = Time.new(current_time.year, current_time.mon, current_time.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  SqlDbHelper.set_pupil_pin_expiry(@pupil['foreName'], @pupil['lastName'], @pupil['school_id'], new_time)
  SqlDbHelper.create_check(new_time, new_time, @pupil['id'])
  SqlDbHelper.set_school_pin(@pupil['school_id'], new_time, 'abc35def')

  @school = SqlDbHelper.find_school(@pupil['school_id'])

  sign_in_page.login(@school['pin'], @pin)
  sign_in_page.sign_in_button.click
end

Given(/^I am on the welcome page$/) do
  step 'I have logged in'
end

Given(/^I am on the instructions page$/) do
  step 'I have logged in'
  confirmation_page.read_instructions.click
end

Given(/^I am on the complete page$/) do
  step 'I have started the check'
  step 'I should be able to use the on screen keyboard to complete the test'
end

Given(/^I logged in with user with access arrangement '(.*)'$/) do|access_arrangmenets_type|
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

  access_arrangements_setting_page.set_access_arrangement(@pupil['id'], new_time, access_arrangmenets_type)

  sign_in_page.login(@school['pin'], @pin)
  sign_in_page.sign_in_button.click
end

Then(/^I can see setting page as per design$/) do
  expect(access_arrangements_setting_page).to have_heading
  expect(access_arrangements_setting_page).to have_information
  expect(access_arrangements_setting_page).to have_sign_out
  expect(access_arrangements_setting_page).to have_next_btn
  expect(access_arrangements_setting_page).to have_access_arrangements_list
end

Then(/^I can see following access arrangement$/) do |table|
  i=0
  table.hashes.each do |hash|
    expected_access_arr_type = hash['access_arrangement_type']
    actual_access_arr_type = access_arrangements_setting_page.access_arrangements_list[i].text
    i= i+1
    expect(actual_access_arr_type.eql?(expected_access_arr_type)).to be_truthy, "Expected: #{expected_access_arr_type}...but got Actual: #{actual_access_arr_type}"
  end
end
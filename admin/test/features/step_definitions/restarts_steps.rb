
Given(/^I am on the Restarts Page$/) do
  restarts_page.load
  restarts_page.select_pupil_to_restart_btn.click
  @page = restarts_page
end

When(/^I navigate to Restarts page$/)do
  school_landing_page.restarts.click
end

Then(/^I should see a heading for the Restarts page$/) do
  expect(restarts_page).to have_heading
end

And(/^I can see the info message for Restarts$/) do
  expect(restarts_page).to have_restarts_message
end

Then(/^I should see a way to add a reason for restarts$/) do
  expect(restarts_page).to have_select_pupil_to_restart_btn
end

Then(/^I should be able to go back to the top of restarts page$/) do
  expect(restarts_page).to have_back_to_top
end

When(/^I want to add a reason for restarts$/) do
  restarts_page.select_pupil_to_restart_btn.click
end

Then(/^I should see set of reasons I can choose for restarts$/) do
  expect(restarts_page).to have_reasons_list
end

Then(/^I should see a section that explains the reasons for restarts$/) do
  expect(restarts_page.explanation_section).to be_all_there
end

Then(/^I should be able to select them via a checkbox for restarts$/) do
  restarts_page.pupil_list.rows.each {|pupil| expect(pupil).to have_checkbox}
end

Then(/^I should have a option to select all pupils for restarts$/) do
  expect(restarts_page).to have_select_all_pupils
end

Then(/^I should not see a sticky banner on restarts page$/) do
  expect(restarts_page.sticky_banner).to_not be_visible
end

And(/^I select a reason for restarts$/) do
  restarts_page.reason_1.click
end

And(/^I submit the pupil for restart with a reason 'Did not complete' for restarts$/) do
  restarts_page.reason_4.click
  step 'I select a pupil for restarts'
  restarts_page.sticky_banner.confirm.click
end

When(/^I select a pupil for restarts$/) do
  pupil = restarts_page.pupil_list.rows.find {|row| row.has_no_selected?}
  pupil.checkbox.click
end

When(/^I select multiple pupils for restarts$/) do
  step 'I select a reason for restarts'
  page.execute_script "window.scrollBy(0,1000)"
  @pupils = restarts_page.pupil_list.rows.select {|row| row.has_no_selected?}
  @pupils[0..3].each {|pupil| pupil.checkbox.click}
  @pupil_names = @pupils[0..3].map {|pupil| pupil.name.text}
end

Then(/^I should see the confirm button enabled for restarts$/) do
  expect(restarts_page.sticky_banner.confirm.disabled?).to be_falsey
end

Then(/^I should be taken to the restarts page$/) do
  expect(restarts_page).to be_displayed
end

Given(/^I have single pupils for restart$/) do
  step 'I have generated a pin for a pupil'

  ct = Time.now
  newTime = ct.strftime("%Y-%m-%d %H:%M:%S.%LZ")
  MongoDbHelper.set_pupil_pin_expiry(@details_hash[:first_name], @details_hash[:last_name], 9991001, newTime)
  MongoDbHelper.reset_pin(@details_hash[:first_name], @details_hash[:last_name], 9991001)

  pupil_id = MongoDbHelper.pupil_details(@details_hash[:upn])
  MongoDbHelper.create_check(newTime, newTime, pupil_id['_id'].to_s, newTime, newTime)
  step 'I am on the Restarts Page'
end

Given(/^I have multiple pupils for restart$/) do
  step 'I have generated pins for multiple pupils'

  ct = Time.now
  newTime = ct.strftime("%Y-%m-%d %H:%M:%S.%LZ")
  @pupil_names_arr.each do|pupil|
    pupil_lastname = pupil.split(',')[0]
    pupil_firstname = pupil.split(',')[1].split(' Date')[0].split(' ')[0]
    MongoDbHelper.set_pupil_pin_expiry(pupil_firstname, pupil_lastname, 9991001, newTime)
    MongoDbHelper.reset_pin(pupil_firstname, pupil_lastname, 9991001)

    pupil_id = MongoDbHelper.pupil_details_using_names(pupil_firstname, pupil_lastname)
    MongoDbHelper.create_check(newTime, newTime, pupil_id['_id'].to_s, newTime, newTime)
  end

  step 'I am on the Restarts Page'
end

Given(/^I submitted pupils for Restart$/) do
  step 'I have single pupils for restart'
  step 'I select a pupil for restarts'
  restarts_page.reason_1.click
  restarts_page.sticky_banner.confirm.click
end

Then(/^I should see a flash message to state the pupil has been submitted for restart$/) do
  expect(restarts_page).to have_flash_message
  expect(restarts_page.flash_message.text).to eql('Restarts made for 1 pupil')
end

Then(/^I should see the error message for further information for 'Did not complete' reason$/) do
  expect(restarts_page.error_summary).to be_all_there
end

Then(/^I should see pupil is added to the pupil restarts list with status '(.*)'$/) do|restart_status|
  hightlighted_row = restarts_page.restarts_pupil_list.rows.find{|row| row.has_highlighted_pupil?}
  expect(hightlighted_row.text).to include("#{@details_hash[:last_name]}, #{@details_hash[:first_name]}")
  expect(hightlighted_row.status.text).to include(restart_status)
end

And(/^Pupil has taken a 2nd check$/) do

  step "I am on the generate pupil pins page"
  step "I click Generate PINs button"
  @page = generate_pupil_pins_page
  @pupil_name = generate_pupil_pins_page.generate_pin_using_name(@details_hash[:first_name])

  ct = Time.now
  newTime = Time.new(ct.year, ct.mon, ct.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  MongoDbHelper.set_pupil_pin_expiry(@details_hash[:first_name], @details_hash[:last_name], 9991001, newTime)
  MongoDbHelper.set_school_pin_expiry('1001', newTime)

  step "I am on the generate pupil pins page"

  ct = Time.now
  newTime = ct.strftime("%Y-%m-%d %H:%M:%S.%LZ")
  MongoDbHelper.set_pupil_pin_expiry(@details_hash[:first_name], @details_hash[:last_name], 9991001, newTime)
  MongoDbHelper.reset_pin(@details_hash[:first_name], @details_hash[:last_name], 9991001)

  pupil_id = MongoDbHelper.pupil_details(@details_hash[:upn])
  MongoDbHelper.create_check(newTime, newTime, pupil_id['_id'].to_s, newTime, newTime)
  restarts_page.load
end

And(/^Pupil has taken a 2nd restart$/) do
  step 'Pupil has taken a 2nd check'
  restarts_page.select_pupil_to_restart_btn.click
  @page = restarts_page
  restarts_page.restarts_for_pupil(@details_hash[:first_name])
end

Then(/^I should see the Restart Status '(.*)' for the pupil$/) do|restart_status|
  pupil_row = restarts_page.restarts_pupil_list.rows.find {|row| row.name.text.eql?("#{@details_hash[:last_name]}, #{@details_hash[:first_name]}")}
  expect(pupil_row.status.text).to include(restart_status)
end
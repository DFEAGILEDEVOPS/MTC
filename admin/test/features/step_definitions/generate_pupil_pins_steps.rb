
And(/^I am on the generate pupil pins page$/) do
  generate_pupil_pins_page.load
end

And(/^I navigate to generate pupil pins page$/) do
  school_landing_page.generate_pupil_pin.click
end

Then(/^I should see a heading for the Generate Pupil Pins$/) do
  expect(generate_pupil_pins_page).to have_heading
end

And(/^I can see the info message for generating the pupil pin$/) do
  expect(generate_pupil_pins_page).to have_generate_pin_message
  expect(generate_pupil_pins_page.info_message.map {|message| message.text}).to include "Generate pupil PINs and school password."
  expect(generate_pupil_pins_page.info_message.map {|message| message.text}).to include "Distribute pupil PINs and school password to your pupils."
end

And(/^I click Generate PINs button$/) do
  generate_pupil_pins_page.generate_pin_btn.click if generate_pupil_pins_page.has_generate_pin_btn?
  generated_pins_page.generate_more_pin_btn.click if generated_pins_page.has_generate_more_pin_btn?
end

Given(/^I have a pupil with active pin$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"
  @pupil_forename = @details_hash[:first_name]
  MongoDbHelper.set_pupil_pin(@details_hash[:first_name], @details_hash[:last_name], 9991001, "abc12345")
end

Given(/^I have a pupil not taking the check$/) do
  step 'I am on the pupil reason page'
  step 'I add Absent as a reason for a particular pupil'
  step 'the Absent reason should be stored against the pupils'
end

Then(/^I cannot see this pupil in the list of Pupil on Generate Pin list page$/) do
  pupils_from_page = generate_pupil_pins_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page.include?(@pupil_forename)).to be_falsy, "#{@pupil_forename} is displayed in the list ... Expected - It Shouldn't"
end

When(/^I click on the Pupil heading$/) do
  generate_pupil_pins_page.pupil_column_heading.click
end

Then(/^I should see a list of pupils sorted by surname in '(.*)' order on Generate Pins List Page$/) do |sort_order|
  if sort_order.eql?('descending')
    sorted_pupils_from_page = generate_pupil_pins_page.pupil_list.rows.map {|x| x.name.text}.sort.reverse
  else
    sorted_pupils_from_page = generate_pupil_pins_page.pupil_list.rows.map {|x| x.name.text}.sort
  end

  pupils_from_page = generate_pupil_pins_page.pupil_list.rows.map {|x| x.name.text}
  expect(sorted_pupils_from_page).to match_array(pupils_from_page)
end

And(/^I am on Generate pins Pupil List page$/) do
  step 'I navigate to generate pupil pins page'
  step 'I click Generate PINs button'
  @page = generate_pupil_pins_page
end

Then(/^I should be able to select them via a checkbox on Generate Pin page$/) do
  generate_pupil_pins_page.pupil_list.rows.each {|pupil| expect(pupil).to have_checkbox}
end

Then(/^I should have a option to select all pupils on Generate Pin page$/) do
  expect(generate_pupil_pins_page).to have_select_all_pupils
end

Then(/^I should be taken to Generate Pupil Pins Page$/) do
  expect(generate_pupil_pins_page).to be_displayed
end

Then(/^I should be taken to Generated Pins Page$/) do
  expect(generated_pins_page).to be_displayed
end

When(/^I select a Pupil from Generate Pin page$/) do
  pupil = generate_pupil_pins_page.pupil_list.rows.find {|row| row.has_no_selected?}
  pupil.checkbox.click
end

When(/^I deselect all pupils from Generate Pin Page$/) do
  generate_pupil_pins_page.select_all_pupils.click
  expect(@page).to have_sticky_banner
  generate_pupil_pins_page.select_all_pupils.click
end

When(/^I select a Pupil to Generate more pins$/) do
  generated_pins_page.generate_more_pin_btn.click
  pupil = generate_pupil_pins_page.pupil_list.rows.find {|row| row.has_no_selected?}
  pupil.checkbox.click
end

When(/^I select multiple pupils from Generate Pin Page$/) do
  @pupils = generate_pupil_pins_page.pupil_list.rows.select {|row| row.has_no_selected?}
  @pupils[0..3].each {|pupil| pupil.checkbox.click}
  @pupil_names = @pupils[0..3].map {|pupil| pupil.name.text}
end

When(/^I have generated a pin for a pupil$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am logged in"
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"
  step "I am on the generate pupil pins page"
  step "I click Generate PINs button"
  @page = generate_pupil_pins_page
  @pupil_name = generate_pupil_pins_page.generate_pin_using_name(name)

  ct = Time.now
  newTime = Time.new(ct.year, ct.mon, ct.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  MongoDbHelper.set_pupil_pin_expiry(@details_hash[:first_name], @details_hash[:last_name], 9991001, newTime)
  MongoDbHelper.set_school_pin_expiry('1001', newTime)

  step "I am on the generate pupil pins page"
end

Given(/^I have generated pin for all pupil$/) do
  step "I am logged in"
  step "I am on Generate pins Pupil List page"
  generate_pupil_pins_page.select_all_pupils.click
  generate_pupil_pins_page.sticky_banner.confirm.click
end

Then(/^the pin should consist of (\d+) characters$/) do |size|
  generate_pupil_pins_page.find_pupil_row(@pupil_name)
  expect(generate_pupil_pins_page.find_pupil_row(@pupil_name).pin.text.size).to eql size.to_i
end

Then(/^all pupil pins should be generated from the specified pool of characters$/) do
  pins_array = generate_pupil_pins_page.pupil_list.rows.map {|pupil| pupil.pin.text}
  pins_array.each {|pin| pin.split('').each {|char| expect("23456789bcdfghjkmnpqrstvwxyz").to include char}}
end

Given(/^I have generated pins for multiple pupils$/) do
  step "I am logged in"
  step "I am on Generate pins Pupil List page"
  @pupil_names_arr = generate_pupil_pins_page.generate_pin_for_multiple_pupils(2)

  ct = Time.now
  newTime = Time.new(ct.year, ct.mon, ct.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  @pupil_names_arr.each do|pupil|
    pupil_lastname = pupil.split(',')[0]
    pupil_firstname = pupil.split(',')[1].split(' Date')[0].split(' ')[0]
    MongoDbHelper.set_pupil_pin_expiry(pupil_firstname, pupil_lastname, 9991001, newTime)
  end
  MongoDbHelper.set_school_pin_expiry('1001', newTime)
  step "I am on the generate pupil pins page"
end

Then(/^each pin should be displayed next to the pupil its assigned to$/) do
  @pupil_names_arr.each {|name| expect(generate_pupil_pins_page.find_pupil_row(name)).to have_pin}
end

Then(/^the pupil pin should be unique$/) do
  pins_before = MongoDbHelper.pupil_pins
  expect(MongoDbHelper.pupil_pins.uniq).to eql pins_before
end

Then(/^the pin should be stored against the pupil$/) do
  pupil_upn = @stored_pupil_details['upn'].to_s
  wait_until{!(MongoDbHelper.pupil_details(pupil_upn)[:pin]).nil?}
  pupil_pin = MongoDbHelper.pupil_details(pupil_upn)[:pin]
  expect(generate_pupil_pins_page.find_pupil_row(@pupil_name).pin.text).to eql pupil_pin
end

Then(/^I should see the school password for (.*)$/) do |teacher|
  school_id = MongoDbHelper.find_teacher(teacher)[0]['school']
  school_password = MongoDbHelper.find_school(school_id)[0]['schoolPin']
  expect(generated_pins_page.school_password.text).to eql school_password
end

Then(/^I should see information for Pupil pin and School password$/) do
  cd = Time.now
  str1 = "#{cd.strftime('%A')} #{cd.strftime('%-d')} #{cd.strftime('%B')}"
  expect(generated_pins_page.school_password_info.text.include?('Pupil PINs and school password generated')).to be_truthy,  "Expected:'Pupil PINs and school password generated' -- not found"
  expect(generated_pins_page.school_password_info.text.include?("Valid only until 4pm, #{str1}")).to be_truthy,  "Expected: 'Valid only until 4pm, #{str1}' -- not found"
end

Then(/^I should see link to download all pupil pins$/) do
  expect(generated_pins_page).to have_download_pin_link
end

Then(/^I should see link to create custom download$/) do
  expect(generated_pins_page).to have_custom_download_link
end
Given(/^I am on the add pupil page$/) do
  step 'I am on the Pupil Register page'
  pupil_register_page.add_pupil.click
  @page = add_pupil_page
end

Then(/^I should see fields that will allow me to capture pupil data$/) do
  expect(@page).to have_first_name
  expect(@page).to have_middle_name
  expect(@page).to have_last_name
  expect(@page).to have_upn
  expect(@page).to have_day
  expect(@page).to have_month
  expect(@page).to have_year
  expect(@page).to have_female
  expect(@page).to have_male
end

And(/^the fields are pre populated with the data$/) do
  expect(@page.first_name.value.eql?(@details_hash[:first_name])).to be_truthy, "Expected Firstname: #{@details_hash[:first_name]}... But Got Actual :#{@page.first_name.value}"
  expect(@page.last_name.value.eql?(@details_hash[:last_name])).to be_truthy, "Expected Lastname: #{@details_hash[:last_name]}... But Got Actual :#{@page.last_name.value}"
  expect(@page.upn.value.eql?(@details_hash[:upn]).to_s).to be_truthy, "Expected UPN: #{@details_hash[:upn]}... But Got Actual :#{@page.upn.value}"
  expect(@page.first_name.value.eql?(@details_hash[:day]).to_s).to be_truthy, "Expected day: #{@details_hash[:day]}... But Got Actual :#{@page.day.value}"
  expect(@page.first_name.value.eql?(@details_hash[:month]).to_s).to be_truthy, "Expected month: #{@details_hash[:month]}... But Got Actual :#{@page.month.value}"
  expect(@page.year.value.eql?(@details_hash[:year]).to_s).to be_truthy, "Expected year: #{@details_hash[:year]}... But Got Actual :#{@page.year.value}"
  if(@details_hash[:female] == true)
    expect(@page.female.checked?).to be_truthy, "Expected Femail radio to be selected...But Actual : Not Selected"
    expect(@page.male.checked?).to be_falsy, "Expected Male radio to be selected...But Actual : Not Selected"
  end
end

When(/^I submit the form without the completing mandatory fields$/) do
  @page.enter_details({
                          middle_name: 'Middle'
                      })
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end

Then(/^I should see validation errors$/) do
  expect(@page.error_summary.gender.text).to eql 'Select a gender' unless @page == edit_pupil_page
  expect(@page.error_messages.map {|message| message.text}).to include 'Select a gender' unless @page == edit_pupil_page
  expect(@page.error_summary.first_name.text).to eql "First name can't be blank"
  expect(@page.error_messages.map {|message| message.text}).to include "First name can't be blank"
  expect(@page.error_summary.last_name.text).to eql "Last name can't be blank"
  expect(@page.error_messages.map {|message| message.text}).to include "Last name can't be blank"
  expect(@page.error_summary.year.text).to eql "Date of birth can't be blank"
  expect(@page.error_messages.map {|message| message.text}).to include "Date of birth can't be blank"
  expect(@page.error_summary.upn.text).to eql "UPN is missing"
  expect(@page.error_messages.map {|message| message.text}).to include "UPN is missing"

end

When(/^I submit the form without completing the optional fields$/) do
  @page.enter_details({
                          first_name: 'First',
                          last_name: 'last',
                          female: true,
                          day: '18',
                          month: '02',
                          year: '1987',
                          upn: UpnGenerator.generate
                      })
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end

Then(/^I should be taken to the profile page$/) do
  expect(profile_page).to be_displayed
end

When(/^I attempt to type letters in the DOB fields$/) do
  @page.enter_details({
                          day: 'abcdefghijklmnopqrstuvyxyz',
                          month: 'abcdefghijklmnopqrstuvyxyz',
                          year: 'abcdefghijklmnopqrstuvyxyz'
                      })
end

Then(/^they should not be entered$/) do
  expect(@page.day.value).to be_empty
  expect(@page.month.value).to be_empty
  expect(@page.year.value).to be_empty
end

When(/^I decide to go back$/) do
  @page.back.click
end

Then(/^I should see a validation error for first name$/) do
  expect(@page.error_summary.first_name.text).to eql "First name can't be blank"
  expect(@page.error_messages.map {|message| message.text}).to include "First name can't be blank"
end

When(/^I submit the form with a first name that is less than (\d+) character long$/) do |number|
  @page.enter_details({
                          first_name: 'a' * (number.to_i - 1),
                          middle_name: 'middle',
                          last_name: 'last',
                          upn: UpnGenerator.generate,
                          female: true,
                          day: '18',
                          month: '02',
                          year: '1987'
                      })
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end

Then(/^I should see a validation error for last name$/) do
  expect(@page.error_summary.last_name.text).to eql "Last name can't be blank"
  expect(@page.error_messages.map {|message| message.text}).to include "Last name can't be blank"
end

When(/^I submit the form with a last name that is less than (\d+) character long$/) do |number|
  @page.enter_details({
                          first_name: 'First',
                          middle_name: 'middle',
                          last_name: 'l' * (number.to_i - 1),
                          upn: UpnGenerator.generate,
                          female: true,
                          day: '18',
                          month: '02',
                          year: '1987'
                      })
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end

When(/^I submit the form with a DOB that is in the future$/) do
  day = (Date.today + 1).strftime('%d')
  month = (Date.today + 1).strftime('%m')
  year = (Date.today + 1).strftime('%Y')
  @page.enter_details({
                          first_name: 'First',
                          middle_name: 'middle',
                          last_name: 'last',
                          upn: UpnGenerator.generate,
                          female: true,
                          day: day,
                          month: month,
                          year: year
                      })
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end

Then(/^I should see a validation error$/) do
  expect(@page.error_summary.year.text).to eql "Date of birth can't be in the future"
  expect(@page.error_messages.map {|message| message.text}).to include "Date of birth can't be in the future"
end

When(/^I have submitted valid pupil details$/) do
  @upn = UpnGenerator.generate
  pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  @details_hash = {first_name: pupil_name, middle_name: pupil_name, last_name: pupil_name, upn: @upn, female: true, day: '18', month: '02', year: '1987'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Time.now.utc.strftime("%Y-%m-%d %H")
end

Then(/^the pupil details should be stored$/) do
  gender = @details_hash[:male] ? 'M' : 'F'
  wait_until {!(MongoDbHelper.pupil_details(@upn.to_s)).nil?}
  @stored_pupil_details = MongoDbHelper.pupil_details @upn.to_s
  expect(@details_hash[:first_name]).to eql @stored_pupil_details['foreName']
  expect(@details_hash[:middle_name]).to eql @stored_pupil_details['middleNames']
  expect(@details_hash[:last_name]).to eql @stored_pupil_details['lastName']
  expect(gender).to eql @stored_pupil_details['gender']
  expect(@details_hash[:upn].to_s.upcase).to eql @stored_pupil_details['upn']
  expect(Time.parse(@details_hash[:day]+ "-"+ @details_hash[:month]+"-"+ @details_hash[:year])).to eql @stored_pupil_details['dob']
  expect(@time_stored).to eql Helpers.time_to_nearest_hour(@stored_pupil_details['createdAt'])
  expect(@time_stored).to eql Helpers.time_to_nearest_hour(@stored_pupil_details['updatedAt'])
end

When(/^I have submitted invalid pupil details$/) do
  @upn = UpnGenerator.generate
  @details_hash = {first_name: '', middle_name: 'm', last_name: 'a', upn: @upn, female: true, day: '18', month: '02', year: '1987'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end

Then(/^the pupil details should not be stored$/) do
  wait_until {(MongoDbHelper.pupil_details @upn.to_s).nil?}
end

When(/^I submit the form with the name fields set as (.*)$/) do |value|
  @upn = UpnGenerator.generate
  @details_hash = {first_name: value, middle_name: value, last_name: value, upn: @upn, female: true, day: '18', month: '02', year: '1987'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should be taken to the add pupil page$/) do
  expect(add_pupil_page).to be_displayed
end

Then(/^there should be a toggle that informs me what a upn is$/) do
  expect(@page).to have_what_is_upn
end

Then(/^there should be text in the what a upn is section$/) do
  expect(@page.what_is_upn).to have_explanatory_text
end

Then(/^I should see a link to more details in the what is a upn section$/) do
  expect(@page.what_is_upn).to have_more_details
end

When(/^I have submitted valid pupil details without choosing a gender$/) do
  @upn = UpnGenerator.generate
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valud', upn: @upn, day: '18', month: '02', year: '1987'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see a error telling me gender is required$/) do
  expect(@page.error_summary.gender.text).to eql 'Select a gender'
  expect(@page.error_messages.map {|message| message.text}).to include 'Select a gender'
end

When(/^I submit the form with a DOB that has (\d+) (day|days) in a month$/) do |days, _x|
  @upn = UpnGenerator.generate
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: days, month: '02', year: '1987'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see a validation error for the day of the month$/) do
  expect(@page.error_summary.day.text).to eql "Please check “Day”"
  expect(@page.error_messages.map {|message| message.text}).to include "Please check “Day”"
end

When(/^I submit the form with a DOB that has (\d+) as the month$/) do |month|
  @upn = UpnGenerator.generate
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: '10', month: month, year: '1987'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see a validation error for the month of the year$/) do
  expect(@page.error_summary.month.text).to eql "Please check “Month”"
  expect(@page.error_messages.map {|message| message.text}).to include "Please check “Month”"
end

When(/^I submit the form with a DOB that has (\d+) years$/) do |year|
  @upn = UpnGenerator.generate
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: '10', month: '02', year: year}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see a validation error for the year$/) do
  expect(@page.error_summary.year.text).to eql "Please check “Year”"
  expect(@page.error_messages.map {|message| message.text}).to include "Please check “Year”"
end

When(/^I attempt to enter names that are more than (\d+) characters long$/) do |number|
  @upn = UpnGenerator.generate
  @long_name = ('F' * (number.to_i + 1))
  @details_hash = {first_name: @long_name, middle_name: @long_name, last_name: @long_name, female: true, upn: @upn, day: '10', month: '02', year: '1990'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see only (\d+) characters are saved$/) do |number|
  wait_until {!(MongoDbHelper.pupil_details(@upn.to_s)).nil?}
  @stored_pupil_details = MongoDbHelper.pupil_details @upn.to_s
  expect(@details_hash[:first_name]).to eql @long_name
  expect(@details_hash[:middle_name]).to eql @long_name
  expect(@details_hash[:last_name]).to eql @long_name
end

When(/^I submit valid details with a already used UPN$/) do
  @upn = 'H801200001001'
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: '10', month: '02', year: '1987'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see an error stating more than (\d+) pupil with the same UPN$/) do |arg|
  expect(@page.error_summary.upn.text).to eql "More than 1 pupil record with same UPN"
  expect(@page.error_messages.map {|message| message.text}).to include "More than 1 pupil record with same UPN"
end

When(/^I submit valid details with a UPN that has a incorrect check letter$/) do
  @upn = UpnGenerator.generate
  @upn[0]= 'O'
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: '10', month: '02', year: '1987'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see an error stating wrong check letter at character (\d+)$/) do |_x|
  expect(@page.error_summary.upn.text).to eql "UPN invalid (wrong check letter at character 1)"
  expect(@page.error_messages.map {|message| message.text}).to include "UPN invalid (wrong check letter at character 1)"
end

When(/^I submit valid details with a UPN that has a invalid LA code$/) do
  @upn = UpnGenerator.generate
  @upn[1..3]= '000'
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: '10', month: '02', year: '1987'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see an error stating characters between 2\-4 are invalid$/) do
  expect(@page.error_summary.upn.text).to eql "UPN invalid (characters 2-4 not a recognised LA code)"
  expect(@page.error_messages.map {|message| message.text}).to include "UPN invalid (characters 2-4 not a recognised LA code)"
end

When(/^I submit valid details with a UPN that has a alpha character between characters 5\-12$/) do
  @upn = UpnGenerator.generate
  @upn[6]= 'A'
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: '10', month: '02', year: '1987'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see an error stating characters between 5\-12 are invalid$/) do
  expect(@page.error_summary.upn.text).to eql "UPN invalid (characters 5-12 not all numeric)"
  expect(@page.error_messages.map {|message| message.text}).to include "UPN invalid (characters 5-12 not all numeric)"
end

When(/^I submit valid details with a UPN that has a invalid alpha character at character 13$/) do
  @upn = UpnGenerator.generate
  @upn[12]= 'S'
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: '10', month: '02', year: '1987'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see an error stating character 13 is invalid$/) do
  expect(@page.error_summary.upn.text).to eql "UPN invalid (character 13 not a recognised value)"
  expect(@page.error_messages.map {|message| message.text}).to include "UPN invalid (character 13 not a recognised value)"
end

When(/^I submit valid details with a UPN has a lowercase alpha character$/) do
  @upn = UpnGenerator.generate
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn.downcase, day: '10', month: '02', year: '1987'}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end


Then(/^I should see a flash message to state the pupil has been added$/) do
  expect(pupil_register_page).to have_info_message
  hightlighted_row = pupil_register_page.pupil_list.pupil_row.find{|row| row.has_edited_pupil?}
  expect(hightlighted_row.text).to include("#{@details_hash[:last_name]}, #{@details_hash[:first_name]}")
end
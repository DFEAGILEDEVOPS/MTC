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
  if (@details_hash[:female] == true)
    expect(@page.female.checked?).to be_truthy, "Expected Femail radio to be selected...But Actual : Not Selected"
    expect(@page.male.checked?).to be_falsy, "Expected Male radio to be selected...But Actual : Not Selected"
  end
end

When(/^I submit the form without the completing mandatory fields$/) do
  @page.enter_details({
                        middle_name: 'Middle',
                        first_name_alias: 'First Alias',
                        last_name_alias: 'Last Alias'
                      })
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end

Then(/^I should see validation errors$/) do
  expect(@page.error_summary.gender.text).to eql 'Enter a gender as M or F' unless @page == edit_pupil_page
  expect(@page.error_messages.map {|message| message.text}).to include 'Enter a gender as M or F' unless @page == edit_pupil_page
  expect(@page.error_summary.first_name.text).to eql "Enter a first name in no more than 128 characters"
  expect(@page.error_messages.map {|message| message.text}).to include "Enter a first name in no more than 128 characters"
  expect(@page.error_summary.last_name.text).to eql "Enter a last name in no more than 128 characters"
  expect(@page.error_messages.map {|message| message.text}).to include "Enter a last name in no more than 128 characters"
  expect(@page.error_summary.year.text).to eql "Enter a date of birth"
  expect(@page.error_messages.map {|message| message.text}).to include "Enter a date of birth"
  expect(@page.error_summary.upn.first.text).to eql "Enter a UPN"
  expect(@page.error_messages.map {|message| message.text}).to include "Enter a UPN"

end

When(/^I submit the form without completing the optional fields$/) do
  dob = calculate_age(9)
  @page.enter_details({
                        first_name: 'First',
                        last_name: 'last',
                        female: true,
                        day: dob.day.to_s,
                        month: dob.month.to_s,
                        year: dob.year.to_s,
                        upn: (@page == edit_pupil_page ? @upn : UpnGenerator.generate)
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
  expect(@page.error_summary.first_name.text).to eql "Enter a first name in no more than 128 characters"
  expect(@page.error_messages.map {|message| message.text}).to include "Enter a first name in no more than 128 characters"
end

When(/^I submit the form with a first name that is less than (\d+) character long$/) do |number|
  @page.enter_details({
                        first_name: 'a' * (number.to_i - 1),
                        middle_name: 'middle',
                        last_name: 'last',
                        upn: (@page == edit_pupil_page ? @upn : UpnGenerator.generate),
                        female: true,
                        day: '18',
                        month: '02',
                        year: '2010'
                      })
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end

Then(/^I should see a validation error for last name$/) do
  expect(@page.error_summary.last_name.text).to eql "Enter a last name in no more than 128 characters"
  expect(@page.error_messages.map {|message| message.text}).to include "Enter a last name in no more than 128 characters"
end

When(/^I submit the form with a last name that is less than (\d+) character long$/) do |number|
  @page.enter_details({
                        first_name: 'First',
                        middle_name: 'middle',
                        last_name: 'l' * (number.to_i - 1),
                        upn: (@page == edit_pupil_page ? @upn : UpnGenerator.generate),
                        female: true,
                        day: '18',
                        month: '02',
                        year: '2010'
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
                        upn: (@page == edit_pupil_page ? @upn : UpnGenerator.generate),
                        female: true,
                        day: day,
                        month: month,
                        year: year
                      })
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end

Then(/^I should see a validation error$/) do
  expect(@page.error_summary.year.text).to eql "Enter a valid date of birth"
  expect(@page.error_messages.map {|message| message.text}).to include "Enter a valid date of birth"
end

When(/^I have submitted valid pupil details$/) do
  today_date = Date.today + 1 
  @upn = UpnGenerator.generate
  pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  @details_hash = {first_name: pupil_name, middle_name: pupil_name, last_name: pupil_name, upn: @upn, female: true, day: "#{today_date.day}", month: "#{today_date.month}", year: "#{today_date.year - 9}"}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Time.now.utc.strftime("%Y-%m-%d %H")
end

Then(/^the pupil details should be stored$/) do
  sleep 2
  expect(pupil_register_page).to be_displayed
  gender = @details_hash[:male] ? 'M' : 'F'
  wait_until {!(SqlDbHelper.pupil_details(@upn.to_s,@school_id)).nil?}
  sleep 2
  @stored_pupil_details = SqlDbHelper.pupil_details(@upn.to_s, @school_id)
  expect(@details_hash[:first_name]).to eql @stored_pupil_details['foreName']
  expect(@details_hash[:middle_name]).to eql @stored_pupil_details['middleNames']
  expect(@details_hash[:last_name]).to eql @stored_pupil_details['lastName']
  expect(gender).to eql @stored_pupil_details['gender']
  expect(@details_hash[:upn].to_s.upcase).to eql @stored_pupil_details['upn']
  expect(Time.parse(@details_hash[:day]+ "-"+ @details_hash[:month]+"-"+ @details_hash[:year]).strftime("%d %m %y")).to eql (@stored_pupil_details['dateOfBirth']).strftime("%d %m %y")
  expect(@time_stored).to eql Helpers.time_to_nearest_hour(@stored_pupil_details['createdAt'])
  expect(@time_stored).to eql Helpers.time_to_nearest_hour(@stored_pupil_details['updatedAt'])
end

When(/^I have submitted invalid pupil details$/) do
  today_date = Date.today
  @upn = UpnGenerator.generate unless @page == edit_pupil_page
  @details_hash = {first_name: '', middle_name: 'm', last_name: 'a', first_name_alias: 's', last_name_alias: 'e', upn: @upn, female: true, day: "#{today_date.day}", month: "#{today_date.month}", year: "#{today_date.year - 9}"}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end

Then(/^the pupil details should not be stored$/) do
  wait_until {(SqlDbHelper.pupil_details @upn.to_s, @school_id).nil?}
end

When(/^I submit the form with the name fields set as (.*)$/) do |value|
  today_date = Date.today + 1
  @upn = UpnGenerator.generate unless @page == edit_pupil_page
  @details_hash = {first_name: value, middle_name: value, last_name: value, first_name_alias: value, last_name_alias: value,  upn: @upn, female: true, day: "#{today_date.day}", month: "#{today_date.month}", year: "#{today_date.year - 9}"}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should be taken to the add pupil page$/) do
  expect(add_pupil_page).to be_displayed
end

Then(/^I can see add pupil page as per the design$/) do
  expect(@page).to have_first_name
  expect(@page).to have_middle_name
  expect(@page).to have_last_name
  expect(@page).to have_first_name_alias
  expect(@page).to have_last_name_alias
  expect(@page).to have_upn
  expect(@page).to have_day
  expect(@page).to have_month
  expect(@page).to have_year
  expect(@page).to have_female
  expect(@page).to have_male
  expect(@page).to have_what_is_upn
  @page.what_is_upn.toggle.click if @page.what_is_upn.explanatory_text.first.text.empty?
  expect(@page.what_is_upn.explanatory_text.map {|a| a.text}.join(' ')).to eql "The UPN is a 13-character code that identifies each pupil in the local authority maintained school system. If your pupil does not have a UPN, please follow the guidance on how to generate UPNs (link opens in a new window)."
  expect(@page.what_is_upn).to have_more_details
end

When(/^I have submitted valid pupil details without choosing a gender$/) do
  today_date = Date.today
  @upn = UpnGenerator.generate
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valud', upn: @upn, day: "#{today_date.day}", month: "#{today_date.month}", year: "#{today_date.year - 9}"}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see a error telling me gender is required$/) do
  expect(@page.error_summary.gender.text).to eql 'Select a gender'
  expect(@page.error_messages.map {|message| message.text}).to include 'Select a gender'
end

When(/^I submit the form with a DOB that has (\d+) (as the day of the month|day in a month|days in a month)$/) do |days, _x|
  today_date = Date.today
  @upn = UpnGenerator.generate unless @page == edit_pupil_page
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: days, month: "#{today_date.month}", year: "#{today_date.year - 9}"}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see a validation error for the day of the month$/) do
  expect(@page.error_summary.day.text).to eql 'Enter a valid day'
  expect(@page.error_messages.map {|message| message.text}).to include "Enter a valid day"
end

When(/^I submit the form with a DOB that has (\d+) as the month$/) do |month|
  @upn = UpnGenerator.generate unless @page == edit_pupil_page
  dob = calculate_age(9)
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: dob.day.to_s, month: month, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see a validation error for the month of the year$/) do
  expect(@page.error_summary.month.text).to eql 'Enter a valid month'
  expect(@page.error_messages.map {|message| message.text}).to include "Enter a valid month"
end

When(/^I submit the form with a DOB that has (\d+) years$/) do |year|
  @upn = UpnGenerator.generate unless @page == edit_pupil_page
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: '10', month: '02', year: year}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see a validation error for the year$/) do
  expect(@page.error_summary.year.text).to eql 'Enter a valid year'
  expect(@page.error_messages.map {|message| message.text}).to include "Enter a valid year"
end

When(/^I attempt to enter names that are more than (\d+) characters long$/) do |number|
  dob = calculate_age(9)
  @upn = UpnGenerator.generate unless @page == edit_pupil_page
  @long_name = ('F' * (number.to_i + 1))
  @details_hash = {first_name: @long_name, middle_name: @long_name, last_name: @long_name, first_name_alias: @long_name, last_name_alias: @long_name, female: true, upn: @upn, day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see only (\d+) characters are saved$/) do |number|
  wait_until {!(SqlDbHelper.pupil_details(@upn.to_s, @school_id)).nil?}
  @stored_pupil_details = SqlDbHelper.pupil_details(@upn.to_s, @school_id)
  expect(@details_hash[:first_name]).to eql @long_name
  expect(@details_hash[:middle_name]).to eql @long_name
  expect(@details_hash[:last_name]).to eql @long_name
end

When(/^I submit valid details with a already used UPN$/) do
  dob = calculate_age(9)
  @upn = @upns_for_school.sample
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see an error stating more than (\d+) pupil with the same UPN$/) do |arg|
  expect(@page.error_summary.upn.map{|error| error.text}).to include "The UPN entered is already assigned to another pupil within your school’s register. Please check all UPN’s are correct. For further support, contact the national curriculum assessments helpline on 0300 303 3013."
  expect(@page.error_messages.map {|message| message.text}.reject { |c| c.empty? }).to include "The UPN entered is already assigned to another pupil within your school’s register. Please check all UPN’s are correct. For further support, contact the national curriculum assessments helpline on 0300 303 3013."
end

When(/^I submit valid details with a UPN that has a incorrect check letter$/) do
  dob = calculate_age(9)
  @upn = UpnGenerator.generate
  @upn[0]= 'O'
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see an error stating wrong check letter at character (\d+)$/) do |_x|
  expect(@page.error_summary.upn.map{|error| error.text}).to include "Enter a valid UPN. First character is not recognised. See guidance for instructions."
  expect(@page.error_messages.map {|message| message.text}.reject { |c| c.empty? }).to include "Enter a valid UPN. First character is not recognised. See guidance for instructions."
end

When(/^I submit valid details with a UPN that has a invalid LA code$/) do
  dob = calculate_age(9)
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: 'A000201100221', day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see an error stating characters between 2\-4 are invalid$/) do
  expect(@page.error_summary.upn.map{|error| error.text}).to include "Enter a valid UPN. Characters 2-4 are not a recognised LA code. See guidance for instructions."
  expect(@page.error_messages.map {|message| message.text}.reject { |c| c.empty? }).to eql  ["Enter a valid UPN. First character is not recognised. See guidance for instructions.", "Enter a valid UPN. Characters 2-4 are not a recognised LA code. See guidance for instructions."]
end

When(/^I submit valid details with a UPN that has a alpha character between characters 5\-12$/) do
  dob = calculate_age(9)
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: 'J80511A100122', day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see an error stating characters between 5\-12 are invalid$/) do
  expect(@page.error_summary.upn.map{|error| error.text}).to include "Enter a valid UPN. Characters 5-12 must be numeric. See guidance for instructions."
  expect(@page.error_messages.map {|message| message.text}.reject { |c| c.empty? }).to eql  ["Enter a valid UPN. First character is not recognised. See guidance for instructions.", "Enter a valid UPN. Characters 5-12 must be numeric. See guidance for instructions."]
end

When(/^I submit valid details with a UPN that has a invalid alpha character at character 13$/) do
  dob = calculate_age(9)
  @upn = UpnGenerator.generate
  @upn[12]= 'S'
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see an error stating character 13 is invalid$/) do
  expect(@page.error_summary.upn.map{|error| error.text}).to include "Enter a valid UPN. Character 13 not recognised. See guidance for instructions."
  expect(@page.error_messages.map {|message| message.text}.reject { |c| c.empty? }).to include "Enter a valid UPN. Character 13 not recognised. See guidance for instructions."
end

When(/^I submit valid details with a UPN has a lowercase alpha character$/) do
  dob = calculate_age(9)
  @upn = UpnGenerator.generate
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn.downcase, day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see a flash message to state the pupil has been added$/) do
  expect(pupil_register_page).to have_new_pupil_info_message
  hightlighted_row = pupil_register_page.pupil_list.pupil_row.find {|row| row.has_edited_pupil?}
  expect(hightlighted_row.text).to include("#{@details_hash[:last_name]}, #{@details_hash[:first_name]}")
end

Then(/^I should see validation error for the DOB field fo the following$/) do |table|
  table.hashes.each do |hash|
    p hash['condition']
    case hash['condition']
      when 'letters in DOB'
        step 'I attempt to type letters in the DOB fields'
        step 'they should not be entered'
      when 'DOB in future'
        step 'I submit the form with a DOB that is in the future'
        step 'I should see a validation error'
      when 'invalid day within a month'
        step 'I submit the form with a DOB that has 32 days in a month'
        step 'I should see a validation error for the day of the month'
      when '3 digit day within a month'
        step 'I submit the form with a DOB that has 320 days in a month'
        step 'I should see a validation error for the day of the month'
      when 'invalid month within a year'
        step 'I submit the form with a DOB that has 32 as the month'
        step 'I should see a validation error for the month of the year'
      when '3 digit month within a year'
        step 'I submit the form with a DOB that has 320 as the month'
        step 'I should see a validation error for the month of the year'
      when 'invalid year'
        step 'I submit the form with a DOB that has 1000 years'
        step 'I should see a validation error for the year'
      when '5 digit year'
        step 'I submit the form with a DOB that has 20070 years'
        step 'I should see a validation error for the year'
    end
  end
end

Then(/^I should see validation error for the UPN field for the following$/) do |table|
  table.hashes.each do |hash|
    visit current_url if Capybara.current_driver.to_s.include? 'ie11'
    p hash['condition']
    case hash['condition']
      when 'wrong check letter'
        step 'I submit valid details with a UPN that has a incorrect check letter'
        step 'I should see an error stating wrong check letter at character 1'
      when 'invalid LA code'
        step 'I submit valid details with a UPN that has a invalid LA code'
        step 'I should see an error stating characters between 2-4 are invalid'
      when 'alpha characters between characters 5-12'
        step 'I submit valid details with a UPN that has a alpha character between characters 5-12'
        step 'I should see an error stating characters between 5-12 are invalid'
      when 'invalid alhpa character at position 13'
        step 'I submit valid details with a UPN that has a invalid alpha character at character 13'
        step 'I should see an error stating character 13 is invalid'
    end
  end
end

When(/^I add 2 pupil with same firstname and lastname and different dob$/) do
  today_date = Date.today
  step "I am logged in"
  step "I am on the add pupil page"
  name = (0...8).map {(65 + rand(26)).chr}.join
  @upn = UpnGenerator.generate unless @page == edit_pupil_page
  @pupil1_dob = today_date - 10.year
  @pupil2_dob = @pupil1_dob + 2
  @details_hash = {first_name: name, middle_name: name, last_name: name, upn: @upn, female: true, day: "#{@pupil1_dob.day}", month: "#{@pupil1_dob.month}", year: "#{@pupil1_dob.year}"}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
  step "I am on the add pupil page"
  @upn = UpnGenerator.generate unless @page == edit_pupil_page
  @details_hash = {first_name: name, middle_name: name, last_name: name, upn: @upn, female: true, day: "#{@pupil2_dob.day}", month: "#{@pupil2_dob.month}", year: "#{@pupil2_dob.year}"}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end

When(/^I add 2 pupil with same firstname lastname and same dob$/) do
  today_date = Date.today
  step "I am logged in"
  step "I am on the add pupil page"
  name = (0...8).map {(65 + rand(26)).chr}.join
  @upn = UpnGenerator.generate unless @page == edit_pupil_page
  @details_hash = {first_name: name, middle_name: 'MiddleName1', last_name: name, upn: @upn, female: true, day: "#{today_date.day}", month: "#{today_date.month}", year: "#{today_date.year - 9}"}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
  step "I am on the add pupil page"
  @upn = UpnGenerator.generate unless @page == edit_pupil_page
  @details_hash = {first_name: name, middle_name: 'MiddleName2', last_name: name, upn: @upn, female: true, day: "#{today_date.day}", month: "#{today_date.month}", year: "#{today_date.year - 9}"}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end


When(/^I submit the form with the pupil dob (\d+) years ago$/) do |years_old|
  @upn = UpnGenerator.generate unless @page == edit_pupil_page
  pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  if years_old == 6
    dob = calculate_age(7)
    dob = dob + 1.day
  else
    dob = calculate_age(years_old)
  end
  @details_hash = {first_name: pupil_name, middle_name: pupil_name, last_name: pupil_name, upn: @upn, female: true, day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @reason_text = "Reason for adding pupil #{@details_hash[:first_name]}"
  @page.reason.text_area.set "Reason for adding pupil #{@details_hash[:first_name]}" if @page.has_reason?
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end


Then(/^I should see an error with the DOB$/) do
  expect(@page.error_messages.map {|message| message.text}).to include "Enter a valid date of birth"
  expect(@page.error_summary.year.text).to include "Enter a valid date of birth"
end


Then(/^I should still be able to add the pupil after filling in the reason box$/) do
  step 'the pupil details should be stored'
  pupil_reason_row = SqlDbHelper.pupil_reason(@stored_pupil_details['id'])
  expect(pupil_reason_row['reason']).to eql @reason_text
  user = SqlDbHelper.find_teacher(@username)
  expect(pupil_reason_row['recordedBy_userId']).to eql user['id']
  expect(pupil_reason_row['lastUpdatedBy_userId']).to eql user['id']
  expect(pupil_reason_row['updatedAt']).to_not be_nil
  expect(pupil_reason_row['createdAt']).to_not be_nil
end

When(/^I fill in the form with the pupil dob (\d+) years ago$/) do |years_old|
  @upn = UpnGenerator.generate unless @page == edit_pupil_page
  pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  if years_old == 6
    dob = calculate_age(7)
    dob = dob + 1.day
  else
    dob = calculate_age(years_old)
  end
  @details_hash = {first_name: pupil_name, middle_name: pupil_name, last_name: pupil_name, upn: @upn, female: true, day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
end


And(/^I submit$/) do
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
end

Then(/^I should see an error with the reason field$/) do
  expect(@page.error_messages.map {|message| message.text}).to include "Enter a reason"
  expect(@page.error_summary.reason.text).to include "Enter a reason"
end


And(/^I add a pupil with names beginning with Z$/) do
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as ZZZZZZZ"
end


Given(/^I have added a pupil$/) do
  step 'I am on the add pupil page'
  step 'I have submitted valid pupil details'
  step 'the pupil details should be stored'
end


When(/^I check the redis cache$/) do
  @pupils_from_redis = (JSON.parse(JSON.parse(REDIS_CLIENT.get('pupilRegisterViewData:2'))['value'])).map{|x| x['fullName']}
end


Then(/^it should include the newly added pupil$/) do
  expect(@pupils_from_redis).to include @details_hash[:last_name] + ', ' + @details_hash[:first_name]
end

When(/^I have submitted valid pupil details including a temporary upn$/) do
    today_date = Date.today + 1
    @upn = UpnGenerator.generate_temporary
    pupil_name = (0...8).map {(65 + rand(26)).chr}.join
    @details_hash = {first_name: pupil_name, middle_name: pupil_name, last_name: pupil_name, upn: @upn, female: true, day: "#{today_date.day}", month: "#{today_date.month}", year: "#{today_date.year - 9}"}
    @page.enter_details(@details_hash)
    @page.add_pupil.click unless @page == edit_pupil_page
    @page.save_changes.click if @page == edit_pupil_page
    @time_stored = Time.now.utc.strftime("%Y-%m-%d %H")
end


When(/^I submit valid details with a temp UPN that has a incorrect check letter$/) do
  dob = calculate_age(9)
  @upn = UpnGenerator.generate_temporary
  @upn[0]= 'O'
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end


When(/^I submit valid details with a temp UPN that has a invalid LA code$/) do
  dob = calculate_age(9)
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: 'Z00011320001X', day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end


When(/^I submit valid details with a temp UPN that has a alpha character between characters 5\-12$/) do
  dob = calculate_age(9)
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: 'U38201A30110B', day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end


When(/^I submit valid details with a temp UPN that has a invalid alpha character at character 13$/) do
  dob = calculate_age(9)
  @upn = UpnGenerator.generate_temporary
  @upn[12]= 'S'
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn, day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^I should see validation error for the UPN field when using a temporary upn for the following$/) do |table|
  table.hashes.each do |hash|
    visit current_url if Capybara.current_driver.to_s.include? 'ie11'
    p hash['condition']
    case hash['condition']
    when 'wrong check letter'
      step 'I submit valid details with a temp UPN that has a incorrect check letter'
      step 'I should see an error stating wrong check letter at character 1'
    when 'invalid LA code'
      step 'I submit valid details with a temp UPN that has a invalid LA code'
      step 'I should see an error stating characters between 2-4 are invalid'
    when 'alpha characters between characters 5-12'
      step 'I submit valid details with a temp UPN that has a alpha character between characters 5-12'
      step 'I should see an error stating characters between 5-12 are invalid'
    when 'invalid alhpa character at position 13'
      step 'I submit valid details with a temp UPN that has a invalid alpha character at character 13'
      step 'I should see an error stating character 13 is invalid'
    end
  end
end


When(/^I submit valid details with a temporary UPN has a lowercase alpha character$/) do
  dob = calculate_age(9)
  @upn = UpnGenerator.generate_temporary
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: @upn.downcase, day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end


When(/^I submit valid details with a already used UPN with a space at the beginning$/) do
  dob = calculate_age(9)
  @upn = @upns_for_school.sample
  @details_hash = {first_name: 'valid', middle_name: 'valid', last_name: 'valid', female: true, upn: " " + @upn, day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  @page.enter_details(@details_hash)
  @page.add_pupil.click unless @page == edit_pupil_page
  @page.save_changes.click if @page == edit_pupil_page
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

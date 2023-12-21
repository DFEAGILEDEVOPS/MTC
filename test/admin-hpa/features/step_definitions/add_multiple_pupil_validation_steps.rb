And(/^I Upload a CSV file with four columns to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, @upn]

  @upn2 = UpnGenerator.generate
  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn2]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with wrong gender format to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, "FEMALE", @upn]

  @upn2 = UpnGenerator.generate
  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn2]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with empty first name and last name to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = ["", "", @pupil_name, old_date1, "F", @upn]

  @upn2 = UpnGenerator.generate
  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn2]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with special character in first name and last name to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = ["#{@pupil_name}_%&*", "#{@pupil_name}_%&*", "#{@pupil_name}_%&*", old_date1, "F", @upn]

  @upn2 = UpnGenerator.generate
  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn2]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with wrong month for date of birth format to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, "30/13/2009", "F", @upn]

  @upn2 = UpnGenerator.generate
  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn2]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with wrong day for date of birth format to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, "32/12/2005", "F", @upn]

  @upn2 = UpnGenerator.generate
  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn2]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with wrong year for date of birth format to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, "03/12/20056", "F", @upn]

  @upn2 = UpnGenerator.generate
  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn2]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with future date of birth to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, "03/12/2020", "F", @upn]

  @upn2 = UpnGenerator.generate
  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn2]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with duplicate UPN from attendance register to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  step 'I Upload a valid CSV file to add Multiple Pupil'
  pupil_register_page.add_multiple_pupil.click
  @page = add_multiple_pupil_page
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, "F", @upn]

  @upn3 = UpnGenerator.generate
  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn3]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with duplicate UPN within uploaded file to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, "F", @upn]

  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with empty UPN to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, "F", ""]

  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with wrong letter for at 1st Char for UPN to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @invalid_first_char_upn = UpnGenerator.generate
  @invalid_first_char_upn[0] = 'O'

  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, "F", @invalid_first_char_upn]

  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with wrong LA code for UPN to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @invalid_la_code_upn = UpnGenerator.generate
  @invalid_la_code_upn[1..3]= '000'
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, "F", @invalid_la_code_upn]

  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with wrong 6th char for UPN to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @invalid_sixth_char_upn = UpnGenerator.generate
  @invalid_sixth_char_upn[6]= 'A'
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, "F", @invalid_sixth_char_upn]

  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with wrong 13th char for UPN to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @invalid_thirteenth_char_upn = UpnGenerator.generate
  @invalid_thirteenth_char_upn[12]= 'S'
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, "F", @invalid_thirteenth_char_upn]

  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with 1 row to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array)
  add_multiple_pupil_page.save.click
end

And(/I Upload a CSV file with more than 300 rows/) do
  add_multiple_pupil_page.upload_multiple_pupil_with_moreThan300Rows
  add_multiple_pupil_page.save.click
end

Then(/^I can see the error message for uploading multiple pupil '(.*)'$/) do |msg|
  expect(add_multiple_pupil_page.error_message.text.include?(msg)).to be_truthy, "Expected: #{msg}...Got the message: #{add_multiple_pupil_page.error_message.text}"
end

Then(/^I can see the validation error for empty first name and last name for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?("Enter a first name in no more than 128 characters, Enter a last name in no more than 128 characters")).to be_truthy, "Expected: 'Enter a first name in no more than 128 characters, Enter a last name in no more than 128 characters, Enter a gender as M or F'... But Got: #{@hashed_data[0][:errors].to_s}"
  expect(@hashed_data[0][:errors].to_s.include?("Enter a first name in no more than 128 characters, Enter a last name in no more than 128 characters")).to be_truthy, "Expected: 'Enter a first name in no more than 128 characters, Enter a last name in no more than 128 characters, Enter a gender as M or F'... But Got: #{@hashed_data[0][:errors].to_s}"
end

Then(/^I can see the validation error for special charchter in first name and last name for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?("Enter a first name without special characters, Enter a middle name without special characters, Enter a last name without special characters")).to be_truthy, "Expected: 'Enter a first name without special characters, Enter a middle name without special characters, Enter a last name without special characters'... But Got: #{@hashed_data[0][:errors].to_s}"
end

Then(/^I can see the validation error for wrong gender for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('Enter a gender as M or F')).to be_truthy, "Expected: 'Enter a gender as M or F'... But Got: #{@hashed_data[0][:errors].to_s}"
end

And(/^I can see the validation error for wrong month for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('Enter a valid month')).to be_truthy, "Expected: 'Enter a valid month'... But Got: #{@hashed_data[0][:errors].to_s}"
end

And(/^I can see the validation error for wrong day for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('Enter a valid day')).to be_truthy, "Expected: 'Enter a valid day'... But Got: #{@hashed_data[0][:errors].to_s}"
end

And(/^I can see the validation error for wrong year for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('Enter a valid year')).to be_truthy, "Expected: 'Enter a valid year'... But Got: #{@hashed_data[0][:errors].to_s}"
end

And(/^I can see the validation error for future date of birth for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?("Enter a valid date of birth")).to be_truthy, "Expected: 'Enter a valid date of birth'... But Got: #{@hashed_data[0][:errors].to_s}"
end

And(/^I can see the validation error for duplicate UPN from attendance register for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('Enter a valid UPN. This one is already in use. Contact the Helpdesk on 0300 303 3013 for guidance.')).to be_truthy, "Expected: 'Enter a valid UPN. This one is already in use. Contact the Helpdesk on 0300 303 3013 for guidance.'... But Got: #{@hashed_data[0][:errors].to_s}"
end

And(/I can see the validation error for duplicate UPN in the spreadsheet for multiple pupil upload/) do
  expect(@hashed_data.select {|data| !data[:errors].nil? }.first[:errors].include?('Enter a valid UPN. This one is a duplicate of another UPN in the spreadsheet')).to be_truthy, "Expected: 'Enter a valid UPN. This one is a duplicate of another UPN in the spreadsheet.'... But Got: #{@hashed_data[1][:errors]}"
end

And(/^I can see the validation error for empty UPN for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('Enter a UPN')).to be_truthy, "Expected: 'Enter a UPN '... But Got: #{@hashed_data[0][:errors].to_s}"
end

Then(/^I can see the validation error for wrong letter for at 1st Char for UPN for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s).to include ('Enter a valid UPN. First character is not recognised. See guidance for instructions.')
end

Then(/^I can see the validation error for wrong LA code for UPN for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s).to include ("Enter a valid UPN. Characters 2-4 are not a recognised LA code. See guidance for instructions.")
end

Then(/^I can see the validation error for wrong 6th char for UPN for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s).to include ('Enter a valid UPN. Characters 5-12 must be numeric. See guidance for instructions.')
end

Then(/^I can see the validation error for wrong 13th char for UPN for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s).to include ('Enter a valid UPN. Character 13 not recognised. See guidance for instructions.')
end


Then(/^the upload button should be disabled$/) do
  expect(add_multiple_pupil_page.save).to be_disabled
end

Then(/^I should see an error stating that the file must be of CSV format$/) do
  expect(add_multiple_pupil_page.error_message.text.include?('Use a CSV file. See guidance for instructions.')).to be_truthy
end

When(/^I Upload a invalid format file to add Multiple Pupil$/) do
  page.attach_file('file-upload', File.join(File.expand_path("#{File.dirname(__FILE__)}/../../data/"), "multiple_pupils_incorrect_format.txt"))
  add_multiple_pupil_page.save.click
end

When(/^I Upload a CSV file with the columns in the incorrect order$/) do
  page.attach_file('file-upload', File.join(File.expand_path("#{File.dirname(__FILE__)}/../../data/"), "multiple_pupils_column_order.csv"))
  add_multiple_pupil_page.save.click
end

Then(/^I should see an error stating that the columns must be of the same order$/) do
  expect(add_multiple_pupil_page.error_message.text.include?('Ensure columns have the same headings and order as the template')).to be_truthy
end

When(/^I Upload a CSV file with the duplicate upns$/) do
  page.attach_file('file-upload', File.join(File.expand_path("#{File.dirname(__FILE__)}/../../data/"), "multiple_pupils_duplicate_upn.csv"))
  add_multiple_pupil_page.save.click
end

Then(/^I should see an error stating that there is a duplicate upn$/) do
  step 'I download the Multiple Pupil upload CSV file with error'
  expect(@hashed_data[1][:errors]).to eql 'Enter a valid UPN. This one is a duplicate of another UPN in the spreadsheet. Contact the Helpdesk on 0300 303 3013 for guidance.'
end


When(/^I attempt to upload a valid CSV file to add Multiple Pupil with a pupil aged (\d+)$/) do |years_old|
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  @old_date1 = dobs[0]
  @old_date2 = calculate_age(years_old).strftime("%d/%m/%Y")
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, @old_date1, "f", @upn]

  @upn2 = UpnGenerator.generate
  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, @old_date2, "M", @upn2]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end


Then(/^I should see an error with the upload stating the DOB is invalid$/) do
  step 'I download the Multiple Pupil upload CSV file with error'
  expect(@hashed_data[1][:errors]).to eql 'Enter a valid date of birth'
end


Then(/^I should see an error with the upload stating i need to use the single upload function$/) do
  step 'I download the Multiple Pupil upload CSV file with error'
  expect(@hashed_data[1][:errors]).to eql 'Enter a valid date of birth. If pupil is outside expected age range, use add single pupil function'
end

And(/^I can see the new pupils added to the list$/) do
  hightlighted_rows = pupil_register_page.pupil_list.pupil_row.find_all {|row| row.has_edited_pupil?}
  hightlighted_row_list = hightlighted_rows.map {|x| x.text}
  expect(hightlighted_row_list).to include("#{@pupil_name}, #{@pupil_name}\n#{(Date.parse(@old_date1)).strftime('%e %b %Y').strip + ' -'}")
  expect(hightlighted_row_list).to include("#{@pupil_name}, #{@pupil_name}\n#{(Date.parse(@old_date2)).strftime('%e %b %Y').strip + ' -'}")
end


When(/^I decide to click on upload without selecting a file$/) do
  add_multiple_pupil_page.save.click
end


Then(/^I should see an error stating i need to upload a CSV$/) do
  expect(add_multiple_pupil_page.error_message.text.include?('Select a file to upload')).to be_truthy
end

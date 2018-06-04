
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
  pupil_detail_array = ["", "", @pupil_name, old_date1, "FEMALE", @upn]

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
  pupil_detail_array = ["#{@pupil_name}_%&*", "#{@pupil_name}_%&*", "#{@pupil_name}_%&*", old_date1, "FEMALE", @upn]

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
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, "30/32/2005", "F", @upn]

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
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, "F",  "X938021200020"]

  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with wrong LA code for UPN to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, "F", "D136021200020"]

  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with wrong 6th char for UPN to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, "F", "D93802X200020"]

  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, old_date2, "M", @upn]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I Upload a CSV file with wrong 13th char for UPN to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  old_date1 = dobs[0]
  old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, old_date1, "F", "D93802120002I"]

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

Then(/^I can see the error message for uploading multiple pupil '(.*)'$/) do|msg|
  expect(add_multiple_pupil_page.error_message.text.include?(msg)).to be_truthy, "Expected: #{msg}...Got the message: #{add_multiple_pupil_page.error_message.text}"
end

Then(/^I can see the validation error for empty first name and last name for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?("First name can't be blank")).to be_truthy, "Expected: 'First name can't be blank'... But Got: #{@hashed_data[0][:errors].to_s}"
  expect(@hashed_data[0][:errors].to_s.include?("Last name can't be blank and can't contain more than 128 characters")).to be_truthy, "Expected: 'Last name can't be blank and can't contain more than 128 characters'... But Got: #{@hashed_data[0][:errors].to_s}"
end

Then(/^I can see the validation error for special charchter in first name and last name for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?("First name can't contain special character")).to be_truthy, "Expected: 'First name can't contain special character'... But Got: #{@hashed_data[0][:errors].to_s}"
  expect(@hashed_data[0][:errors].to_s.include?("Last name can't contain special characters")).to be_truthy, "Expected: 'Last name can't contain special characters'... But Got: #{@hashed_data[0][:errors].to_s}"
  expect(@hashed_data[0][:errors].to_s.include?("Check the middle name does not contain special characters")).to be_truthy, "Expected: 'Check the middle name does not contain special characters'... But Got: #{@hashed_data[0][:errors].to_s}"

end

Then(/^I can see the validation error for wrong gender for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('Gender must be M or F')).to be_truthy, "Expected: 'Gender must be M or F'... But Got: #{@hashed_data[0][:errors].to_s}"
end

And(/^I can see the validation error for wrong month for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('Enter a valid month for date of birth')).to be_truthy, "Expected: 'Enter a valid month for date of birth'... But Got: #{@hashed_data[0][:errors].to_s}"
end

And(/^I can see the validation error for wrong day for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('Enter a valid day for date of birth')).to be_truthy, "Expected: 'Enter a valid day for date of birth'... But Got: #{@hashed_data[0][:errors].to_s}"
end

And(/^I can see the validation error for wrong year for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('Enter a valid year for date of birth')).to be_truthy, "Expected: 'Enter a valid year for date of birth'... But Got: #{@hashed_data[0][:errors].to_s}"
end

And(/^I can see the validation error for future date of birth for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?("Date of birth can't be in the future")).to be_truthy, "Expected: 'Date of birth can't be in the future'... But Got: #{@hashed_data[0][:errors].to_s}"
end

And(/^I can see the validation error for duplicate UPN from attendance register for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('UPN is a duplicate of a pupil already in your register')).to be_truthy, "Expected: 'UPN is a duplicate of a pupil already in your register'... But Got: #{@hashed_data[0][:errors].to_s}"
end

And(/I can see the validation error for duplicate UPN in the spreadsheet for multiple pupil upload/) do
  expect(@hashed_data[1][:errors].include?('Enter a valid UPN. This one is a duplicate of another UPN in the spreadsheet')).to be_truthy, "Expected: 'Enter a valid UPN. This one is a duplicate of another UPN in the spreadsheet.'... But Got: #{@hashed_data[1][:errors]}"
end

And(/^I can see the validation error for empty UPN for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('UPN is missing')).to be_truthy, "Expected: 'UPN is missing'... But Got: #{@hashed_data[0][:errors].to_s}"
end

Then(/^I can see the validation error for wrong letter for at 1st Char for UPN for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('UPN invalid (wrong check letter at character 1)')).to be_truthy, "Expected: 'UPN invalid (wrong check letter at character 1)'... But Got: #{@hashed_data[0][:errors].to_s}"
end

Then(/^I can see the validation error for wrong LA code for UPN for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('UPN invalid (characters 2-4 not a recognised LA code)')).to be_truthy, "Expected: 'UPN invalid (characters 2-4 not a recognised LA code)'... But Got: #{@hashed_data[0][:errors].to_s}"
end

Then(/^I can see the validation error for wrong 6th char for UPN for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('UPN invalid (characters 5-12 not all numeric)')).to be_truthy, "Expected: 'UPN invalid (characters 5-12 not all numeric)'... But Got: #{@hashed_data[0][:errors].to_s}"
end

Then(/^I can see the validation error for wrong 13th char for UPN for multiple pupil upload$/) do
  expect(@hashed_data[0][:errors].to_s.include?('UPN invalid (character 13 not a recognised value)')).to be_truthy, "Expected: 'UPN invalid (character 13 not a recognised value)'... But Got: #{@hashed_data[0][:errors].to_s}"
end


Then(/^the upload button should be disabled$/) do
  expect(add_multiple_pupil_page.save).to be_disabled
end
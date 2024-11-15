
And(/^I am on the add multiple pupil page$/) do
  sleep 2
  add_multiple_pupil_page.load
end

Then(/^I can see the landing page as per the design$/) do
  expect(add_multiple_pupil_page).to have_heading
  expect(@page.sub_heading.map {|message| message.text}).to include "Download template"
  expect(@page.sub_heading.map {|message| message.text}).to include "Upload file"
  expect(@page.info_message.map {|message| message.text}).to include "Download the template\nPupil details template (CSV, 0.05KB)"
  expect(@page.info_message.map {|message| message.text}).to include "Open file in a CSV compatible programme such as Excel, OpenOffice or Google Sheets"
  expect(@page.info_message.map {|message| message.text}).to include "add pupil details using the given format"
  expect(@page.info_message.map {|message| message.text}).to include "enter date of birth in format dd/mm/yyyy"
  expect(@page.info_message.map {|message| message.text}).to include "enter a gender as M or F"
  expect(@page.info_message.map {|message| message.text}).to include "Save as a CSV file on your computer"
  expect(@page.info_message.map {|message| message.text}).to include "Select 'Choose file' and navigate to the file on your computer"
  expect(@page.info_message.map {|message| message.text}).to include "Choose the file to upload"
  expect(@page.info_message.map {|message| message.text}).to include "Select 'Upload'"
  expect(@page).to have_chose_file
end

When(/^I Upload a valid CSV file to add Multiple Pupil$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  @old_date1 = dobs[0]
  @old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  @pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, @old_date1, "f", @upn]

  @upn2 = UpnGenerator.generate
  @pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, @old_date2, "M", @upn2]

  add_multiple_pupil_page.upload_multiple_pupil(@pupil_detail_array, @pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

When(/^I Upload a CSV file with errors to add Multiple Pupil$/) do
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

And(/^I should see a flash message for the multiple pupil upload$/) do
  expect(pupil_register_page.add_multiple_pupil_info_message.text.include?('2 new pupils have been added')).to be_truthy, "Got the message: '#{pupil_register_page.add_multiple_pupil_info_message.text}'"
end

And(/^I can see the new pupil in the list$/) do
  pupil_list = pupil_register_page.pupil_list.pupil_row.map{|x| x.text}
  expect(pupil_list).to include("#{@pupil_name}, #{@pupil_name}\n#{(Date.parse(@old_date1)).strftime('%e %b %Y').strip + ' -'}")
  expect(pupil_list).to include("#{@pupil_name}, #{@pupil_name}\n#{(Date.parse(@old_date2)).strftime('%e %b %Y').strip + ' -'}")
end

And(/^I can see the error message for adding Multiple Pupil$/) do
  expect(add_multiple_pupil_page.error_message.text.include?("You need to fix the errors on this page before continuing.\nDownload the file below with errors indicated.\nCorrect the errors and upload the updated file.\nPupil details file with errors (CSV, 0.19KB)")).to be_truthy, "Got the message: #{add_multiple_pupil_page.error_message.text}"
end

And(/^I can see link to download Error File$/) do
  expect(add_multiple_pupil_page).to have_error_csv_file
  expect(add_multiple_pupil_page.error_csv_file.text.include?('Pupil details file with errors')).to be_truthy, "Got Error file link Text : '#{add_multiple_pupil_page.error_csv_file.text}'"
end

When(/^I download the Multiple Pupil upload CSV file with error$/) do
  sleep 2
  page.execute_script("window.downloadCSVXHR = function(){ var url = '#{ENV["ADMIN_BASE_URL"]}/pupil-register/pupil/download-error-csv'; return getFile(url); }")
  page.execute_script("window.getFile = function(url) { var xhr = new XMLHttpRequest();  xhr.open('GET', url, false);  xhr.send(null); return xhr.responseText; }")
  data = page.evaluate_script("downloadCSVXHR()")
  File.open(File.join(File.expand_path("#{File.dirname(__FILE__)}/../../data/"), "multiple_pupils_errors.csv"), "w") { |f| f.write(data) }
  data = CSV.read(File.expand_path("#{File.dirname(__FILE__)}/../../data/multiple_pupils_errors.csv"), **options={ encoding: "UTF-8", headers: true, header_converters: :symbol, converters: :all, liberal_parsing: true})
  @hashed_data = data.map { |d| d.to_hash }
end


Then(/^it should include the newly added pupils$/) do
  expect(@pupils_from_redis.select {|x| x == @pupil_detail_array[0] + ', '+ @pupil_detail_array[0] + ' ' + @pupil_detail_array[2]}.size).to eql 2
end


When(/^I Upload a valid CSV file to add Multiple Pupil using temporary upns$/) do
  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  @old_date1 = dobs[0]
  @old_date2 = dobs[1]
  @upn = UpnGenerator.generate_temporary
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  @pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, @old_date1, "f", @upn]

  @upn2 = UpnGenerator.generate
  @pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, @old_date2, "M", @upn2]

  add_multiple_pupil_page.upload_multiple_pupil(@pupil_detail_array, @pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

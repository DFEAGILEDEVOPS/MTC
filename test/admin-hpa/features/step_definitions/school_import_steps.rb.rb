Given(/^I have imported a csv with schools$/) do
  @school_import = File.expand_path("#{File.dirname(__FILE__)}/../../data/school-data.csv")
  step 'I have signed in with service-manager'
  admin_page.school_search.click
  manage_organisations_page.upload.click
  upload_organisations_page.upload_schools(@school_import)
  upload_organisations_page.upload.click
end

Then(/^they should be stored alongside the existing schools$/) do
  @urns_included_array = CSV.parse(File.read(@school_import)).map {|z| z[0] unless z[6] == '2' || z[0] == 'URN'}.compact
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until !SqlDbHelper.find_school_by_urn(@urns_included_array[0]).nil?}
  @urns_included_array.each do |urn|
    expect(SqlDbHelper.find_school_by_urn(urn)).to_not be_nil
  end
  wait_until{(visit current_url;upload_organisations_page.has_completed?)}
  expect(upload_organisations_page).to have_download_job_output
end

And(/^closed schools should not be imported$/) do
  urns_exlcuded_array = CSV.parse(File.read(@school_import)).map {|z| z[0] if z[6] == '2'}.compact
  urns_exlcuded_array.each do |urn|
    expect(SqlDbHelper.find_school_by_urn(urn)).to be_nil
  end
  upload_organisations_page.download_job_output.click
  zip_path = File.expand_path("#{File.dirname(__FILE__)}/../../data/download/job-output.zip")
  destination = File.expand_path("#{File.dirname(__FILE__)}/../../data/download")
  wait_until{File.exist? zip_path}
  output_hash = upload_organisations_page.extract_job_output(zip_path,destination)
  urns_exlcuded_array.each do |urn|
    expect(output_hash[:output].map {|x| x.split('Z ').last}).to include "school-import: Excluding school #{urn} it is closed - estabStatusCode is [2]"
  end
end

Given(/^I have inserted a school successfully$/) do
  @school_import = File.expand_path("#{File.dirname(__FILE__)}/../../data/duplicate-school-data.csv")
  @urns_included_array = CSV.parse(@school_import).map {|z| z[0] unless z[6] == '2' || z[0] == 'URN'}.compact
  step 'I have signed in with service-manager'
  admin_page.school_search.click
  manage_organisations_page.upload.click
  upload_organisations_page.upload_schools(@school_import)
  upload_organisations_page.upload.click
  step 'they should be stored alongside the existing schools'
end

When(/^I attempt to insert the school again$/) do
  @school_import = File.expand_path("#{File.dirname(__FILE__)}/../../data/duplicate-school-data.csv")
  @urns_included_array = CSV.parse(File.read(@school_import)).map {|z| z[0] unless z[6] == '2' || z[0] == 'URN'}.compact
  manage_organisations_page.load
  manage_organisations_page.upload.click
  upload_organisations_page.upload_schools(@school_import)
  upload_organisations_page.upload.click
end

Then(/^I should get an error saying the school is a duplicate$/) do
  wait_until{(visit current_url;upload_organisations_page.has_failed?)}
  expect(upload_organisations_page.error.text).to include "Cannot insert duplicate key row in object 'mtc_admin.school' with unique index 'school_dfeNumber_uindex'. The duplicate key value is (#{CSV.parse(File.read(@school_import))[1][1..2].join()})."
end

Given(/^I attempt to import using a csv file that is in the incorrect format$/) do
  @school_import = File.expand_path("#{File.dirname(__FILE__)}/../../data/incorrect-format-school-data.csv")
  step 'I have signed in with service-manager'
  admin_page.school_search.click
  manage_organisations_page.upload.click
  upload_organisations_page.upload_schools(@school_import)
  upload_organisations_page.upload.click
end

Then(/^I should get an error saying the csv is incorrect$/) do
  wait_until{(visit current_url;upload_organisations_page.has_failed?)}
  expect(upload_organisations_page.error.text).to include 'Headers "URN", "LA (code)", "EstablishmentNumber", "EstablishmentName", "StatutoryLowAge", "StatutoryHighAge", "EstablishmentStatus (code)", "TypeOfEstablishment (code)", "EstablishmentTypeGroup (code)" not found'
end

Given(/^I attempt to import using a csv file that has leaCode set to null$/) do
  @school_import = File.expand_path("#{File.dirname(__FILE__)}/../../data/null-leacode-data.csv")
  step 'I have signed in with service-manager'
  admin_page.school_search.click
  manage_organisations_page.upload.click
  upload_organisations_page.upload_schools(@school_import)
  upload_organisations_page.upload.click
end

Then(/^I should get an error stating that leaCode can not be null$/) do
  wait_until{(visit current_url;upload_organisations_page.has_completed?)}
  upload_organisations_page.download_job_output.click
  zip_path = File.expand_path("#{File.dirname(__FILE__)}/../../data/download/job-output.zip")
  destination = File.expand_path("#{File.dirname(__FILE__)}/../../data/download")
  wait_until{File.exist? zip_path}
  output_hash = upload_organisations_page.extract_job_output(zip_path,destination)
  urns = CSV.parse(File.read(@school_import)).map {|z| z[0] unless z[6] == '2' || z[0] == 'URN'}.compact
  urns.each do |urn|
    expect(output_hash[:output].map {|x| x.split('Z ').last}).to include "school-import: Excluding school #{urn}: leaCode is required"
  end
  expect(output_hash[:output].map {|x| x.split('Z ').last}).to include "school records excluded in filtering:2. No records to persist, exiting."
end

Given(/^I attempt to import using a csv file that has estab code set to null$/) do
  @school_import = File.expand_path("#{File.dirname(__FILE__)}/../../data/null-estab-data.csv")
  step 'I have signed in with service-manager'
  admin_page.school_search.click
  manage_organisations_page.upload.click
  upload_organisations_page.upload_schools(@school_import)
  upload_organisations_page.upload.click
end

Then(/^I should get an error stating that estabCode can not be null$/) do
  wait_until{(visit current_url;upload_organisations_page.has_completed?)}
  upload_organisations_page.download_job_output.click
  zip_path = File.expand_path("#{File.dirname(__FILE__)}/../../data/download/job-output.zip")
  destination = File.expand_path("#{File.dirname(__FILE__)}/../../data/download")
  wait_until{File.exist? zip_path}
  output_hash = upload_organisations_page.extract_job_output(zip_path,destination)
  urns = CSV.parse(File.read(@school_import)).map {|z| z[0] unless z[6] == '2' || z[0] == 'URN'}.compact
  urns.each do |urn|
    expect(output_hash[:output].map {|x| x.split('Z ').last}).to include "school-import: Excluding school #{urn}: estabCode is required"
  end
  expect(output_hash[:output].map {|x| x.split('Z ').last}).to include "school records excluded in filtering:2. No records to persist, exiting."
end

Given(/^I attempt to import using a csv file that has URN set to null$/) do
  @school_import = File.expand_path("#{File.dirname(__FILE__)}/../../data/null-urn-data.csv")
  step 'I have signed in with service-manager'
  admin_page.school_search.click
  manage_organisations_page.upload.click
  upload_organisations_page.upload_schools(@school_import)
  upload_organisations_page.upload.click
end

Then(/^I should get an error stating that URN can not be null$/) do
  wait_until{(visit current_url;upload_organisations_page.has_completed?)}
  upload_organisations_page.download_job_output.click
  zip_path = File.expand_path("#{File.dirname(__FILE__)}/../../data/download/job-output.zip")
  destination = File.expand_path("#{File.dirname(__FILE__)}/../../data/download")
  wait_until{File.exist? zip_path}
  output_hash = upload_organisations_page.extract_job_output(zip_path,destination)
  expect(output_hash[:output].map {|x| x.split('Z ').last}).to include "school-import: Excluding school : urn is required"
  expect(output_hash[:output].map {|x| x.split('Z ').last}).to include "school records excluded in filtering:2. No records to persist, exiting."
end


Given(/^I attempt to import using a csv file that has school name set to null$/) do
  @school_import = File.expand_path("#{File.dirname(__FILE__)}/../../data/null-names-data.csv")
  step 'I have signed in with service-manager'
  admin_page.school_search.click
  manage_organisations_page.upload.click
  upload_organisations_page.upload_schools(@school_import)
  upload_organisations_page.upload.click
end

Then(/^I should get an error stating that school name can not be null$/) do
  wait_until{(visit current_url;upload_organisations_page.has_completed?)}
  upload_organisations_page.download_job_output.click
  zip_path = File.expand_path("#{File.dirname(__FILE__)}/../../data/download/job-output.zip")
  destination = File.expand_path("#{File.dirname(__FILE__)}/../../data/download")
  wait_until{File.exist? zip_path}
  output_hash = upload_organisations_page.extract_job_output(zip_path,destination)
  urns = CSV.parse(File.read(@school_import)).map {|z| z[0] unless z[6] == '2' || z[0] == 'URN'}.compact
  urns.each do |urn|
    expect(output_hash[:output].map {|x| x.split('Z ').last}).to include "school-import: Excluding school #{urn}: name is required"
  end
  expect(output_hash[:output].map {|x| x.split('Z ').last}).to include "school records excluded in filtering:2. No records to persist, exiting."
end

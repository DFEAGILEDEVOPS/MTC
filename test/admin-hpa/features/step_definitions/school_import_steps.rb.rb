Given(/^I have imported a csv with schools$/) do
  @school_import = File.read(File.expand_path("#{File.dirname(__FILE__)}/../../data/school-data.csv"))
  AZURE_BLOB_CLIENT.create_block_blob('school-import', 'school-data.csv', @school_import)
end

Then(/^they should be stored alongside the existing schools$/) do
  @urns_included_array = CSV.parse(@school_import).map {|z| z[0] unless z[6] == '2' || z[0] == 'URN'}.compact
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until !SqlDbHelper.find_school_by_urn(@urns_included_array[0]).nil?}
  @urns_included_array.each do |urn|
    expect(SqlDbHelper.find_school_by_urn(urn)).to_not be_nil
  end
end

And(/^closed schools should not be imported$/) do
  urns_exlcuded_array = CSV.parse(@school_import).map {|z| z[0] if z[6] == '2'}.compact
  urns_exlcuded_array.each do |urn|
    expect(SqlDbHelper.find_school_by_urn(urn)).to be_nil
  end
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}.size > 2}
  files = AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}
  error_log_array = AZURE_BLOB_CLIENT.get_blob('school-import', files.find {|file| file.include? '-school-data-output-log.txt'}).last.split("\n")
  urns_exlcuded_array.each do |urn|
    expect(error_log_array.map {|x| x.split('Z ').last}).to include "school-import: Excluding school #{urn} it is closed - estabStatusCode is [2]"
  end
end

Given(/^I have inserted a school successfully$/) do
  @school_import = File.read(File.expand_path("#{File.dirname(__FILE__)}/../../data/duplicate-school-data.csv"))
  @urns_included_array = CSV.parse(@school_import).map {|z| z[0] unless z[6] == '2' || z[0] == 'URN'}.compact
  AZURE_BLOB_CLIENT.create_block_blob('school-import', 'duplicate-school-data.csv', @school_import)
  step 'they should be stored alongside the existing schools'
  files = AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}
  files.each do |filename|
    AZURE_BLOB_CLIENT.delete_blob('school-import', filename)
  end
end

When(/^I attempt to insert the school again$/) do
  @school_import = File.read(File.expand_path("#{File.dirname(__FILE__)}/../../data/duplicate-school-data.csv"))
  @urns_included_array = CSV.parse(@school_import).map {|z| z[0] unless z[6] == '2' || z[0] == 'URN'}.compact
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until !SqlDbHelper.find_school_by_urn(@urns_included_array[0]).nil?}
  AZURE_BLOB_CLIENT.create_block_blob('school-import', 'duplicate-school-data.csv', @school_import)
end

Then(/^I should get an error saying the school is a duplicate$/) do
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}.size > 2}
  files = AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}
  error_log_array = AZURE_BLOB_CLIENT.get_blob('school-import', files.find {|file| file.include? '-school-data-error-log.txt'}).last.split("nnn")
  expect(error_log_array.map {|x| x.split('Z ').last}).to include "school-import: Bulk request failed. Error was:\n Cannot insert duplicate key row in object 'mtc_admin.school' with unique index 'school_dfeNumber_uindex'. The duplicate key value is (#{CSV.parse(@school_import)[1][1..2].join()})."
end

Given(/^I attempt to import using a csv file that is in the incorrect format$/) do
  @school_import = File.read(File.expand_path("#{File.dirname(__FILE__)}/../../data/incorrect-format-school-data.csv"))
  AZURE_BLOB_CLIENT.create_block_blob('school-import', 'incorrect-format-school-data.csv', @school_import)
end

Then(/^I should get an error saying the csv is incorrect$/) do
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}.size > 2}
  files = AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}
  error_log_array = AZURE_BLOB_CLIENT.get_blob('school-import', files.find {|file| file.include? '-school-data-error-log.txt'}).last
  expect(error_log_array).to include 'Failed to map columns, error raised was Headers "URN", "LA (code)", "EstablishmentNumber", "EstablishmentName", "StatutoryLowAge", "StatutoryHighAge", "EstablishmentStatus (code)", "TypeOfEstablishment (code)", "EstablishmentTypeGroup (code)" not found'
end

Given(/^I attempt to import using a csv file that has leaCode set to null$/) do
  @school_import = File.read(File.expand_path("#{File.dirname(__FILE__)}/../../data/null-leacode-data.csv"))
  AZURE_BLOB_CLIENT.create_block_blob('school-import', 'null-leacode-data.csv', @school_import)
end

Then(/^I should get an error stating that leaCode can not be null$/) do
  urns = CSV.parse(@school_import).map {|z| z[0] unless z[6] == '2' || z[0] == 'URN'}.compact
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}.size > 2}
  files = AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}
  error_log_array = AZURE_BLOB_CLIENT.get_blob('school-import', files.find {|file| file.include? '-null-leacode-data-output-log.txt'}).last.split("\n")
  urns.each do |urn|
    expect(error_log_array.map {|x| x.split('Z ').last}).to include "school-import: Excluding school #{urn}: leaCode is required"
  end
  expect(error_log_array.map {|x| x.split('Z ').last}).to include "school records excluded in filtering:2. No records to persist, exiting."
end

Given(/^I attempt to import using a csv file that has estab code set to null$/) do
  @school_import = File.read(File.expand_path("#{File.dirname(__FILE__)}/../../data/null-estab-data.csv"))
  AZURE_BLOB_CLIENT.create_block_blob('school-import', 'null-estab-data.csv', @school_import)
end

Then(/^I should get an error stating that estabCode can not be null$/) do
  urns = CSV.parse(@school_import).map {|z| z[0] unless z[6] == '2' || z[0] == 'URN'}.compact
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}.size > 2}
  files = AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}
  error_log_array = AZURE_BLOB_CLIENT.get_blob('school-import', files.find {|file| file.include? '-null-estab-data-output-log.txt'}).last.split("\n")
  urns.each do |urn|
    expect(error_log_array.map {|x| x.split('Z ').last}).to include "school-import: Excluding school #{urn}: estabCode is required"
  end
  expect(error_log_array.map {|x| x.split('Z ').last}).to include "school records excluded in filtering:2. No records to persist, exiting."
end

Given(/^I attempt to import using a csv file that has URN set to null$/) do
  @school_import = File.read(File.expand_path("#{File.dirname(__FILE__)}/../../data/null-urn-data.csv"))
  AZURE_BLOB_CLIENT.create_block_blob('school-import', 'null-urn-data.csv', @school_import)
end

Then(/^I should get an error stating that URN can not be null$/) do
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}.size > 2}
  files = AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}
  error_log_array = AZURE_BLOB_CLIENT.get_blob('school-import', files.find {|file| file.include? '-null-urn-data-output-log.txt'}).last.split("\n")
  expect(error_log_array.map {|x| x.split('Z ').last}).to include "school-import: Excluding school : urn is required"
  expect(error_log_array.map {|x| x.split('Z ').last}).to include "school records excluded in filtering:2. No records to persist, exiting."
end


Given(/^I attempt to import using a csv file that has school name set to null$/) do
  @school_import = File.read(File.expand_path("#{File.dirname(__FILE__)}/../../data/null-names-data.csv"))
  AZURE_BLOB_CLIENT.create_block_blob('school-import', 'null-names-data.csv', @school_import)
end

Then(/^I should get an error stating that school name can not be null$/) do
  urns = CSV.parse(@school_import).map {|z| z[0] unless z[6] == '2' || z[0] == 'URN'}.compact
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}.size > 2}
  files = AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}
  error_log_array = AZURE_BLOB_CLIENT.get_blob('school-import', files.find {|file| file.include? '-null-names-data-output-log.txt'}).last.split("\n")
  urns.each do |urn|
    expect(error_log_array.map {|x| x.split('Z ').last}).to include "school-import: Excluding school #{urn}: name is required"
  end
  expect(error_log_array.map {|x| x.split('Z ').last}).to include "school records excluded in filtering:2. No records to persist, exiting."
end

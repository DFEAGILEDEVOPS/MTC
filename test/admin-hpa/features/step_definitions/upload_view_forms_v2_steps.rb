When(/^I am on the Upload and View forms page v2$/) do
  testdeveloper_landing_page.upload_and_view_forms.click
end

Then(/^I should see the page matches design$/) do
  expect(upload_and_view_forms_v2_page).to have_heading
  expect(upload_and_view_forms_v2_page).to have_info
  expect(upload_and_view_forms_v2_page).to have_upload_new_form
  expect(upload_and_view_forms_v2_page).to have_related
end

When(/^I select to upload a new form$/) do
  upload_and_view_forms_v2_page.upload_new_form.click
end

Then(/^the upload form page matches design$/) do
  expect(upload_new_forms_page).to have_heading
  expect(upload_new_forms_page).to have_download_form_example_template
  expect(upload_new_forms_page).to have_new_form_info_message
  expect(upload_new_forms_page).to have_chose_file
  expect(upload_new_forms_page).to have_live_check_form
  expect(upload_new_forms_page).to have_familiarisation_check_form
  expect(upload_new_forms_page).to have_upload
  expect(upload_new_forms_page).to have_cancel
end


And(/^I submit without selecting a type or a form$/) do
  upload_new_forms_page.upload.click
end


Then(/^I should see an error stating I need to select a form and a type$/) do
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql ["Select a file to upload", "Select try it out form or MTC form"]
end


When(/^I have uploaded a valid (.*) form$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file_path)
end

Then(/^it should be tagged as a (.*) form$/) do |type|
  expect(SqlDbHelper.check_form_details(@file_name.split('.')[0])['isLiveCheckForm']).to be true if type == 'live'
  expect(SqlDbHelper.check_form_details(@file_name.split('.')[0])['isLiveCheckForm']).to be false if type == 'familiarisation'
end

And(/^I decide to overwrite the existing familiarisation form by uploading a new (.+) form$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @overwrite_file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@overwrite_file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.confirm_overwrite.click
end


Then(/^the previous form should be replaced$/) do
  previous_familiarisation_form = SqlDbHelper.check_form_details(@file_name.split('.')[0])
  current_familiarisation_form = SqlDbHelper.check_form_details(@overwrite_file_name.split('.')[0])
  expect(previous_familiarisation_form['isDeleted']).to be true
  expect(current_familiarisation_form['isDeleted']).to be false
end


And(/^I decide to cancel overwriting the existing (.+) form$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @overwrite_file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@overwrite_file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.cancel_overwrite.click
end

Then(/^the previous form should be not overwritten$/) do
  previous_familiarisation_form = SqlDbHelper.check_form_details(@file_name.split('.')[0])
  expect(previous_familiarisation_form['isDeleted']).to be false
end


When(/^I attempt to upload 2 (.+) forms$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file1_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file1_path = "data/fixtures/#{@file1_name}"
  upload_new_forms_page.create_unique_check_csv(@file1_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  @file2_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file2_path = "data/fixtures/#{@file2_name}"
  upload_new_forms_page.create_unique_check_csv(@file2_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', [File.expand_path("#{@file1_path}"), File.expand_path("#{@file2_path}")])
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
end


Then(/^I should be shown a validation error$/) do
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql ["Select one try it out form for upload"]
end


Then(/^they should be saved and tagged as a live form$/) do
  expect(SqlDbHelper.check_form_details(@file1_name.split('.')[0])['isDeleted']).to be false
  expect(SqlDbHelper.check_form_details(@file1_name.split('.')[0])['isLiveCheckForm']).to be true
  expect(SqlDbHelper.check_form_details(@file2_name.split('.')[0])['isDeleted']).to be false
  expect(SqlDbHelper.check_form_details(@file2_name.split('.')[0])['isLiveCheckForm']).to be true
end


When(/^I attempt to upload a file that is not csv file$/) do
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "test-check-form-#{rand(234243234234234)}.txt"
  @file_path = "data/fixtures/#{@file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.live_check_form.click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file_path)
end

Then(/^I should see an error stating the file is in an invalid format$/) do
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql ["#{@file_name.split('.')[0]} must be a CSV file"]
end


When(/^I attempt to upload a (.*) file that is not exactly 25 rows of data$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file1_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file1_path = "data/fixtures/#{@file1_name}"
  upload_new_forms_page.create_unique_check_csv(@file1_path, File.read(File.expand_path('data/24-rows.csv')))
  @file2_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file2_path = "data/fixtures/#{@file2_name}"
  upload_new_forms_page.create_unique_check_csv(@file2_path, File.read(File.expand_path('data/26-rows.csv')))
  live_files = [File.expand_path("#{@file1_path}"), File.expand_path("#{@file2_path}")]
  familiarisation_files = live_files[0]
  page.attach_file('csvFiles', live_files) if type == 'live'
  page.attach_file('csvFiles', familiarisation_files) if type == 'familiarisation'
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file1_path)
  upload_new_forms_page.delete_csv_file(@file2_path)
end


Then(/^I should see an error stating the (.+) file needs to be 25 rows of data$/) do |type|
  live_error_array = ["#{@file1_name.split('.')[0]} must contain exactly 25 items",
                      "#{@file1_name.split('.')[0]} must contain exactly 50 integers",
                      "#{@file2_name.split('.')[0]} must contain exactly 25 items",
                      "#{@file2_name.split('.')[0]} must contain exactly 50 integers"]
  familiarisation_error_array = live_error_array[0..1]
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql (type == 'live' ? live_error_array : familiarisation_error_array)
end


But(/^when I choose a valid (.+) file$/) do |type|
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file_path)
end

But(/^when I correct the (.*) file to have exactly 25 rows of data$/) do |type|
  step "when I choose a valid #{type} file"
end

Then(/^the (.*) file should be uploaded$/) do |type|
  step "it should be tagged as a #{type} form"
end


When(/^I attempt to upload a (.*) file that is not exactly 50 integers$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file1_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file1_path = "data/fixtures/#{@file1_name}"
  upload_new_forms_page.create_unique_check_csv(@file1_path, File.read(File.expand_path('data/greater_than_50_integers.csv')))
  @file2_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file2_path = "data/fixtures/#{@file2_name}"
  upload_new_forms_page.create_unique_check_csv(@file2_path, File.read(File.expand_path('data/less_than_50_integers.csv')))
  live_files = [File.expand_path("#{@file1_path}"), File.expand_path("#{@file2_path}")]
  familiarisation_files = live_files[0]
  page.attach_file('csvFiles', live_files) if type == 'live'
  page.attach_file('csvFiles', familiarisation_files) if type == 'familiarisation'
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file1_path)
  upload_new_forms_page.delete_csv_file(@file2_path)
end


Then(/^I should see an error stating the (.*) file needs to be exactly 50 integers$/) do |type|
  live_error_array = ["#{@file1_name.split('.')[0]} must contain exactly 25 items",
                      "#{@file1_name.split('.')[0]} must contain exactly 50 integers",
                      "#{@file2_name.split('.')[0]} must contain exactly 25 items",
                      "#{@file2_name.split('.')[0]} must contain exactly 50 integers"]
  familiarisation_error_array = live_error_array[0..1]
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql (type == 'live' ? live_error_array : familiarisation_error_array)
end


But(/^when I correct the (.*) file to have exactly 50 integers$/) do |type|
  step "when I choose a valid #{type} file"
end

When(/^I attempt to upload a (.*) file that is not exactly 2 columns$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file1_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file1_path = "data/fixtures/#{@file1_name}"
  upload_new_forms_page.create_unique_check_csv(@file1_path, File.read(File.expand_path('data/2-columns.csv')))
  @file2_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file2_path = "data/fixtures/#{@file2_name}"
  upload_new_forms_page.create_unique_check_csv(@file2_path, File.read(File.expand_path('data/3-columns.csv')))
  live_files = [File.expand_path("#{@file1_path}"), File.expand_path("#{@file2_path}")]
  familiarisation_files = live_files[0]
  page.attach_file('csvFiles', live_files) if type == 'live'
  page.attach_file('csvFiles', familiarisation_files) if type == 'familiarisation'
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file1_path)
  upload_new_forms_page.delete_csv_file(@file2_path)
end


Then(/^I should see an error stating the (.*) file needs to be exactly 2 columns$/) do |type|
  live_error_array = ["#{@file1_name.split('.')[0]} must contain exactly 2 columns",
                      "Check file format for #{@file1_name.split('.')[0]}",
                      "#{@file1_name.split('.')[0]} must contain exactly 50 integers",
                      "#{@file2_name.split('.')[0]} must contain exactly 2 columns",
                      "#{@file2_name.split('.')[0]} must contain exactly 50 integers"]
  familiarisation_error_array = live_error_array[0..2]
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql (type == 'live' ? live_error_array : familiarisation_error_array)
end


But(/^when I correct the (.*) file to have exactly 2 columns$/) do |type|
  step "when I choose a valid #{type} file"
end


When(/^I attempt to upload a (.*) file that doesnt only contain integers, commas and quotation marks$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/invalid-characters.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file_path)
end

Then(/^I should see an error stating the (.*) file has to only contain integers, commas and quotation marks$/) do |type|
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql ["Check file format for #{@file_name.split('.')[0]}"]
end

But(/^when I correct the (.*) file to have only integers, commas and quotation marks$/) do |type|
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/quotes-around-values.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file_path)
end


When(/^I attempt to upload a (.+) file that doesnt only contain integers between 1 and 12$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/greater-than-12_times_table.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file_path)
end


Then(/^I should see an error stating the (.*) file has to only contain integers between 1 and 12$/) do |type|
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql ["#{@file_name.split('.')[0]} must only contain numbers 1 to 12"]
end


But(/^when I correct the (.*) file to have only integers between 1 and 12$/) do |type|
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file_path)
end


When(/^I attempt to upload a (.+) file with a file name greater than 128 characters long$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "test-check-form-lon#{('g' * 110)}.csv"
  @file_path = "data/fixtures/#{@file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file_path)
end


Then(/^I should see an error stating the (.+) file name has to be between 1 and 128 characters long$/) do |type|
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql ["#{@file_name.split('.')[0]} must contain no more than 128 characters in name"]
end


But(/^when I correct the (.*) file name to be between 1 and 128 characters long$/) do |type|
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file_path)
end


When(/^I attempt to upload more than 10 live files at one time$/) do
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @array_of_files = []
  11.times do
    @file_name = "test-check-form-#{rand(234243234234234)}.csv"
    @file_path = "data/fixtures/#{@file_name}"
    upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
    @array_of_files << @file_path
  end
  files = @array_of_files.map {|file| File.expand_path(file)}
  page.attach_file('csvFiles', files)
  upload_new_forms_page.live_check_form.click
  upload_new_forms_page.upload.click
  @array_of_files.each do |file|
    upload_new_forms_page.delete_csv_file(file)
  end
end


Then(/^I should see an error stating the max to upload is 10$/) do
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql ["Select a maximum of 10 files to upload at a time"]
end


But(/^when I choose (\d+) live files$/) do |arg|
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @array_of_files = []
  10.times do
    @file_name = "test-check-form-#{rand(234243234234234)}.csv"
    @file_path = "data/fixtures/#{@file_name}"
    upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
    @array_of_files << @file_path
  end
  files = @array_of_files.map {|file| File.expand_path(file)}
  page.attach_file('csvFiles', files)
  upload_new_forms_page.live_check_form.click
  upload_new_forms_page.upload.click
  @array_of_files.each do |file|
    upload_new_forms_page.delete_csv_file(file)
  end
end

Then(/^the live files should be uploaded$/) do
  @array_of_files.each do |file|
    expect(SqlDbHelper.check_form_details(File.basename(file).split('.')[0])['isLiveCheckForm']).to be true
  end
end


When(/^I attempt to upload a (.+) file with the same file name as one previously uploaded$/) do |type|
  step "I have uploaded a valid #{type} form"
  upload_new_forms_page.load
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.confirm_overwrite.click if type == 'familiarisation'
  upload_new_forms_page.delete_csv_file(@file_path)
end


Then(/^I should see an error stating the (.*) file name is a duplicate$/) do |type|
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql ["#{@file_name.split('.')[0]} already exists. Rename and upload again"]
end


But(/^when I correct the (.*) file to not be a duplicate file name$/) do |type|
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.confirm_overwrite.click if type == 'familiarisation'
  upload_new_forms_page.delete_csv_file(@file_path)
end


Then(/^it should be displayed as a (.*) form on the view forms page$/) do |type|
  new_form_row = upload_and_view_forms_v2_page.form_list.rows.find {|row| row.name.text == @file_name.split('.')[0]}
  expect(new_form_row).to have_highlighted
  expect(upload_and_view_forms_v2_page).to have_flash_message
  type = 'MTC' if type=='live'
  type = 'Try it out' if type=='familiarisation'
  expect(new_form_row.type.text).to eql type
  expect(new_form_row.uploaded_on.text).to eql Time.now.strftime("%Y-%m-%d")
  expect(new_form_row).to have_remove
end


Then(/^i should be able to delete the (.*) form$/) do |type|
  new_form_row = upload_and_view_forms_v2_page.form_list.rows.find {|row| row.name.text == @file_name.split('.')[0]}
  new_form_row.remove.click
  upload_and_view_forms_v2_page.confirm_delete.click
  expect(SqlDbHelper.check_form_details(@file_name.split('.')[0])['isDeleted']).to be true
end


But(/^I delete the (.+) form$/) do |type|
  step "i should be able to delete the #{type} form"
end

When(/^I try to reupload the same (.*) form$/) do |type|
  upload_new_forms_page.load
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.confirm_overwrite.click unless  SqlDbHelper.familiarisation_check_form
  upload_new_forms_page.delete_csv_file(@file_path)
end

Then(/^I should be shown an error stating the (.*) file is a duplicate$/) do |type|
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql ["#{@file_name.split('.')[0]} already exists. Rename and upload again"]
end


Then(/^there should be no way to remove a assigned form$/) do
  assigned_form = upload_and_view_forms_v2_page.form_list.rows.find {|row| row.name.text == 'MTC0100'}
  expect(assigned_form).to_not have_remove
end

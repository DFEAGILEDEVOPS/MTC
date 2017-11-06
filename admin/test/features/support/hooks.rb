Before do
  page.current_window.resize_to(1270,768)
end

Before("@add_a_pupil") do
  step "I am logged in"
  @name = (0...8).map { (65 + rand(26)).chr }.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{@name}"
  step "the pupil details should be stored"
end

Before("@timer_reset") do
  step "I have logged in with test-developer"
 step 'I am on the admin page'
 step 'I am on the check settings page'
 check_settings_page.update_question_time_limit(5)
 check_settings_page.update_loading_time_limit(2)
end

Before("@add_5_pupils") do
  step "I am logged in"
  5.times do
    @name = (0...8).map { (65 + rand(26)).chr }.join
    step "I am on the add pupil page"
    step "I submit the form with the name fields set as #{@name}"
    step "the pupil details should be stored"
  end
end

Before("@poltergeist") do
  Capybara.current_driver = :poltergeist
end

Before("@pupil_not_taking_check") do
  step "I am logged in"
  pupils_not_taking_check_page.load
  expect(pupils_not_taking_check_page).to be_displayed
  rows = all('a', text: 'Remove').count
  rows.to_i.times do |row|
    all('a', text: 'Remove').first.click
    pupils_not_taking_check_page.load
  end if pupils_not_taking_check_page.has_pupil_list?
  pupils_not_taking_check_page.sign_out.click
  visit current_url
end

Before("@create_new_window") do
  step "I am on the create a check window page"
  step "I submit details for a valid check window"
  step "I should see it added to the list of windows"
  step "stored correctly in the database"
  visit Capybara.app_host + '/sign-out'
end

Before("~@poltergeist") do
  Capybara.current_driver = ENV['DRIVER']
end

Before("@no_pin") do
  step "I am logged in"
  step "I navigate to generate pupil pins page"
  if (generated_pins_page.has_school_password_info?)
    pupil_with_pin = generate_pupil_pins_page.pupil_list.rows.map {|x| x.name.text}
    pupil_with_pin.each do|pupil|
      pupil_lastname = pupil.split(',')[0]
      pupil_firstname = pupil.split(',')[1].split(' Date')[0].split(' ')[0]
      MongoDbHelper.reset_pin(pupil_firstname, pupil_lastname, 9991001)
    end
  end
  visit Capybara.app_host + '/sign-out'
end

After("@multiple_pupil_upload") do
  FileUtils.rm(File.expand_path("#{File.dirname(__FILE__)}/../../data/multiple_pupils_template.csv"))
end

After do |scenario|
  visit ENV['BASE_URL'] + '/sign-out'
  if (scenario.failed?)
    image_name = "screenshots/#{scenario.__id__}.png"
    save_screenshot(image_name, :full => true)
    embed(image_name, "image/png", "SCREENSHOT")
  end
end
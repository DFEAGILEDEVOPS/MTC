# Before("~@sign_in") do
#   step "I am logged in"
# end

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

Before("~@poltergeist") do
  Capybara.current_driver = ENV['DRIVER']
end

After do |scenario|
  visit ENV['BASE_URL'] + '/sign-out'
  if (scenario.failed?)
    image_name = "screenshots/#{scenario.__id__}.png"
    save_screenshot(image_name, :full => true)
    embed(image_name, "image/png", "SCREENSHOT")
  end
end
Before("~@sign_in") do
  step "I am logged in"
end

Before("@add_a_pupil") do
  @name = (0...8).map { (65 + rand(26)).chr }.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{@name}"
  step "the pupil details should be stored"
end

Before("@add_5_pupils") do
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
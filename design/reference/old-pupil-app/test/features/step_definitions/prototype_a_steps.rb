Given(/^4 digit pins have been generated$/) do
  @array_of_pins = MongoDbHelper.pin_retriever
end

Then(/^they should only consist of numbers between 0 and 9$/) do
  @array_of_pins.each {|pin| expect(pin !~ /\D/).to be true}
end

Then(/^I should see a field for the first letter of pupil name$/) do
  expect(sign_in_page).to have_first_letter
end

Then(/^I should see a pin field$/) do

end


Given(/^I have attempted to login (\d+) times$/) do |arg|
  @current_failed_attempts = MongoDbHelper.failed_login_attempts
  @arg = arg
  arg.to_i.times do
    step 'I am on the sign in page'
    sign_in_page.login('1234', '1234') if AUTH == '5'
    sign_in_page.login('1234') if AUTH == '4'
    sign_in_page.sign_in_button.click
    expect(sign_in_failure_page).to be_displayed
    sign_in_failure_page.retry_sign_in.click
  end
end

Then(/^the number of attempts should be recorded$/) do
  wait_until{MongoDbHelper.failed_login_attempts == (@current_failed_attempts + @arg.to_i)} # explicit wait until both are equal
end

Given(/^I have not entered any sign in details$/) do
  step 'I am on the sign in page'
  sign_in_page.sign_in_button.click
end

Then(/^I should see a error page$/) do
  expect(sign_in_failure_page).to be_displayed
end

Given(/^I have entered ABCD for my pin$/) do
  step 'I am on the sign in page'
  sign_in_page.login('1234')
  sign_in_page.sign_in_button.click
end

Given(/^I have not entered a pin$/) do
  @current_failed_attempts = MongoDbHelper.failed_login_attempts
  step 'I am on the sign in page'
  sign_in_page.sign_in_button.click
end

Then(/^I should not be logged in$/) do
  expect(sign_in_failure_page).to be_displayed
end

And(/^the login attempt should be recorded$/) do
  wait_until{MongoDbHelper.failed_login_attempts == (@current_failed_attempts + 1)}
end

Given(/^I have not entered a valid pin$/) do
  @current_failed_attempts = MongoDbHelper.failed_login_attempts
  sign_in_page.load
  array_of_pins = MongoDbHelper.pin_retriever
  sign_in_page.pin.set array_of_pins[rand(array_of_pins.size)]
  sign_in_page.sign_in_button.click
end

Given(/^I have entered a pin that has expired$/) do
  @current_failed_attempts = MongoDbHelper.failed_login_attempts
  sign_in_page.load
  if AUTH == '5'
    sign_in_page.school_pin.set('13231')
    sign_in_page.pupil_pin.set('12123')
  else
    sign_in_page.pin.set '0000'
  end
  sign_in_page.sign_in_button.click
end

Then(/^the details of the login should be recorded$/) do
  session_id = URI.unescape(get_me_the_cookie('pupil-app.sid')[:value]).split(':')[1].split('.')[0]
  event = MongoDbHelper.logon_event(session_id)
  if AUTH
    expect(event['isAuthenticated']).to be true
    expect(event['schoolPin']).to eql "abc12345"
    expect(event['pupilPin']).to eql "9999a"
  else
    expect(event['isAuthenticated']).to be true
    expect(event['pin4Digit']).to eql @pin
    expect(event['dobMonth']).to eql 12
    expect(event['dobDay']).to eql 1
    expect(event['firstCharacterOfSurname']).to eql 'a'
  end
end
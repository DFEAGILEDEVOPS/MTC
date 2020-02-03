Given(/^a pupil has started a check$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am logged in"
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"
  step "I am on the generate pupil pins page"
  step "I click Generate PINs button"
  generate_pins_overview_page.generate_pin_using_name(name)
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  AzureTableHelper.wait_for_prepared_check(@pupil_credentials[:school_password],@pupil_credentials[:pin])
  visit ENV["PUPIL_BASE_URL"] + check_sign_in_page.url
  p 'login credentials ' + @pupil_credentials[:school_password]+ ', ' + @pupil_credentials[:pin]
  check_sign_in_page.login(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  check_sign_in_page.sign_in_button.click
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
  mtc_check_start_page.start_now.click
  sleep 3
end

Given(/^I complete the warm up questions using the (.+)$/) do |input_type|
  @warm_up_inputs = warm_up_page.complete_check_with_correct_answers(3, input_type)
end


When(/^I am on the Pupil Status page$/) do
  pupil_status_page.load
end

Given(/^I am on the confirmation page$/) do
  step 'I have generated a live pin'
  step 'I have logged in'
  step 'I should be taken to the confirmation page'
end

When(/^I attempt to refresh the page$/) do
  visit current_url
end

Then(/^I should remain on the confirmation page$/) do
  step 'I should be taken to the confirmation page'
end

Then(/^I should remain on the instructions page$/) do
  step 'I should be taken to the instructions page'
end

Given(/^I have refreshed through the warm up questions$/) do
  step 'I am on the warm up check page'
  3.times do
    check_page.has_preload?
    check_page.has_question?
    visit current_url
    sleep 1
  end
end

Then(/^I should be taken to the warm up complete page$/) do
  expect(warm_up_complete_page).to be_displayed
  storage1 = page.evaluate_script('window.localStorage;')
  storage_audit_keys = storage1.keys.select { |x| x.include?('audit') }
  local_storage = []
  storage_audit_keys.each do |key|
    local_storage << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end

  sleep 2
  expect(local_storage.select { |a| a['type'] == 'RefreshDetected' }.count).to eql 3
end

Then(/^I should remain on the warm up intro page$/) do
  expect(warm_up_page).to be_displayed
  expect(warm_up_page).to have_heading
end

Then(/^I should remain on the warm up complete page$/) do
  expect(warm_up_complete_page).to be_displayed
  expect(warm_up_complete_page).to have_heading
end

Given(/^I am on question (.*) of the check$/) do |number|
  @number = number.to_i
  step 'I have generated a live pin'
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  @question_strings = create_question_strings(JSON.parse(page.evaluate_script('window.localStorage.getItem("questions");')))
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
  start_mtc
  check_page.wait_for_question
  check_page.wait_for_answer
  check_page.complete_check_with_correct_answers((@number - 1), 'numpad') until check_page.question.text == @question_strings[@number - 1]
end

But(/^the next question has loaded so I continue with the check$/) do
  unless @number == 10
    check_page.wait_for_preload
    check_page.wait_for_question
    expect(check_page.question.text).to eql @question_strings[@number]
    check_page.complete_check_with_correct_answers(@question_strings.size - @number, 'numpad')
  end
  complete_page.wait_for_complete_page
  expect(complete_page).to have_completion_text
end

Then(/^the audit and inputs recorded should reflect this$/) do
  refresh_audit_index = 25
  question_index = @number - 1
  audit_location_index = (question_index * 5) + refresh_audit_index
  expect(JSON.parse(page.evaluate_script('window.localStorage.getItem("audit");'))[audit_location_index]['type']).to eql 'RefreshDetected'
end

Then(/^I should remain on the complete page$/) do
  step 'I should see a complete page heading'
  step 'I should see some text stating i have completed the check'
end

Given(/^I have refreshed on every question page$/) do
  step 'I have generated a live pin'
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  @question_strings = create_question_strings(JSON.parse(page.evaluate_script('window.localStorage.getItem("questions");')))
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
  start_mtc
  @array_of_questions = []
  @question_strings.size.times do
    check_page.wait_for_question
    @array_of_questions << check_page.question.text
    visit current_url
  end
  complete_page.wait_for_complete_page
end

Then(/^I should see the complete page after seeing all the questions$/) do
  expect(complete_page).to be_displayed
  expect(@array_of_questions).to eql @question_strings
end

And(/^audit and inputs recorded should reflect this$/) do
  storage1 = page.evaluate_script('window.localStorage;')
  storage_audit_keys = storage1.keys.select { |x| x.include?('audit') }
  local_storage = []
  storage_audit_keys.each do |key|
    local_storage << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end

  expect(local_storage.select { |a| a['type'] == 'RefreshDetected' }.count).to eql @array_of_questions.size
end

Given(/^I have completed the check with refersh on instruction page$/) do
  step 'I have generated a live pin'
  step 'I have logged in'
  confirmation_page.read_instructions.click
  visit current_url
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  @question_strings = create_question_strings(JSON.parse(page.evaluate_script('window.localStorage.getItem("questions");')))
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
  start_mtc
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  @answers = check_page.complete_check_with_correct_answers(questions.size, 'numpad')
  complete_page.wait_for_complete_page
  expect(complete_page).to have_heading
end

And(/^audit recorded should reflect this refresh event$/) do
  storage1 = page.evaluate_script('window.localStorage;')
  storage_audit_keys = storage1.keys.select { |x| x.include?('audit') }
  local_storage = []
  storage_audit_keys.each do |key|
    local_storage << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end
  expect(local_storage.find { |a| a['type'] == 'RefreshOrTabCloseDetected' }).to_not be_nil
end

Given(/^I navigated to different tab during the check$/) do
  step 'I have generated a live pin'
  step 'I have logged in'
  confirmation_page.read_instructions.click
  visit current_url
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  @question_strings = create_question_strings(JSON.parse(page.evaluate_script('window.localStorage.getItem("questions");')))
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
  start_mtc
  check_page.complete_check_with_correct_answers(25, 'keyboard')

  first_tab = page.windows.first
  new_window = Capybara.open_new_window
  switch_to_window new_window
  visit ENV['ADMIN_BASE_URL']
  sleep(1)
  page.switch_to_window page.windows.first
  visit current_url
  complete_page.wait_for_complete_page
  expect(complete_page).to have_heading
end

And(/^audit recorded should reflect the navigation of tab$/) do
  storage1 = page.evaluate_script('window.localStorage;')
  storage_audit_keys = storage1.keys.select { |x| x.include?('audit') }
  local_storage = []
  storage_audit_keys.each do |key|
    local_storage << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end
  expect(local_storage.find { |a| a['type'] == 'AppVisible' }).to_not be_nil
  expect(local_storage.find { |a| a['type'] == 'AppHidden' }).to_not be_nil
end

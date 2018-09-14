
Given /^I am on the ICT Survey landing page$/ do
  ict_survey_page.load
end

Then /^ICT survey landing page is displayed as per design$/ do
  expect(ict_survey_page). to have_heading
  expect(ict_survey_page). to have_purpose_message
  expect(ict_survey_page). to have_info_message_1
  expect(ict_survey_page). to have_info_message_2
  expect(ict_survey_page). to have_info_message_3
  expect(ict_survey_page). to have_start_now_button

  ict_survey_page.more_detail.toggle.click
  expect(ict_survey_page.more_detail).to be_all_there

  expect(ict_survey_page). to have_footer_privacy_link
  expect(ict_survey_page). to have_footer_contact_link
  expect(ict_survey_page). to have_footer_cookies_link
end

Given(/^I have taken the preview before giving feedback$/) do
  step 'I am on the ICT Survey landing page'

  ict_survey_page.start_now_button.click
  ict_survey_page.wait_for_test_to_finish
  ict_survey_page.preview_multiplication_table_check.click

  step 'I have completed the preview'
end

And(/^I have completed the preview$/) do
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
  mtc_check_start_page.start_now.click

  check_page.wait_for_question
  check_page.wait_for_answer
  check_page.complete_check_with_correct_answers((5), 'numpad')
end

Then(/^I am on the Preview completed page with Feedback link$/) do
  ict_survey_page.wait_until_heading_visible
  expect(ict_survey_page.heading.text.eql?('Preview completed')). to be_truthy, "expected Heading: 'Preview completed' ..but got : #{ict_survey_page.heading.text}"
end
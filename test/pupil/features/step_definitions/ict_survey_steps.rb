
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
  binding.pry
  expect(ict_survey_page.more_detail).to be_all_there

  expect(ict_survey_page). to have_footer_privacy_link
  expect(ict_survey_page). to have_footer_contact_link
  expect(ict_survey_page). to have_footer_cookies_link
end
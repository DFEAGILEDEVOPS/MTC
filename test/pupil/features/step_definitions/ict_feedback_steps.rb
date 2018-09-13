Given(/^I am on the ICT survey feedback page$/) do
  ict_feedback_page.load
end

Then(/^the ICT survey feedback page should match design$/) do
  expect(ict_feedback_page).to have_heading
  expect(ict_feedback_page).to have_problem_text
  expect(ict_feedback_page).to have_text_area
  expect(ict_feedback_page).to have_optional_heading
  expect(ict_feedback_page).to have_optional_text
  expect(ict_feedback_page).to have_first_name
  expect(ict_feedback_page).to have_last_name
  expect(ict_feedback_page).to have_contact_number
  expect(ict_feedback_page).to have_email
  expect(ict_feedback_page).to have_school_name
  expect(ict_feedback_page).to have_submit_feedback
end

Then(/^I should only be to answer with (\d+) characters$/) do |arg|
  str = "f" * arg
  ict_feedback_page.text_area.set (str + 'g')
  ict_feedback_page.submit_feedback.click
  expect(ict_feedback_page.error_summary.error_messages.first.text).to eql 'Feedback comment limit is 1200 characters'
end

Then(/^I submit my ict survey feedback$/) do
  ict_feedback_page.enter_complete_feedback
  ict_feedback_page.submit_feedback.click
end

When(/^I attempt to only submit my contact details$/) do
  ict_feedback_page.enter_contact_details
  ict_feedback_page.submit_feedback.click
end

Then(/^I should be shown an error$/) do
  expect(ict_feedback_page.error_summary.error_messages.first.text).to eql 'Feedback comment is missing'
end

When(/^I attempt to submit only the feedback on problems faced$/) do
  ict_feedback_page.text_area.set 'This is my feedback on the ICT survey'
  ict_feedback_page.submit_feedback.click
end

Then(/^I should be taken to the feedback thanks page$/) do
  expect(ict_feedback_thanks_page).to be_displayed
end
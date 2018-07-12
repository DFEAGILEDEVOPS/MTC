
Given(/^I choose to give feedback$/) do
  complete_page.feedback.click
end

Then(/^I should be able to provide my method of entry$/) do
  expect(feedback_page).to have_touchscreen
  expect(feedback_page).to have_mouse
  expect(feedback_page).to have_keyboard
  expect(feedback_page).to have_mix
end

Then(/^I should be able to give feedback on how difficult it was to enter answers$/) do
  expect(feedback_page).to have_very_easy
  expect(feedback_page).to have_easy
  expect(feedback_page).to have_neither
  expect(feedback_page).to have_difficult
  expect(feedback_page).to have_very_difficult
end

When(/^I have provided my feedback$/) do
  feedback_page.keyboard.click
  feedback_page.very_easy.click
  feedback_page.comments_field.set 'Test feedback'
end

Then(/^I should be able to submit my feedback$/) do
  feedback_page.submit.click
end

Then(/^I should be shown the thanks page$/) do
  expect(feedback_thanks_page).to be_displayed
  expect(feedback_thanks_page).to have_feedback_thanks
  expect(feedback_thanks_page).to have_next_pupil
end

When(/^I feedback on how difficult the check was$/) do
  feedback_page.very_easy.click
end

Then(/^I should see the submit button disabled$/) do
  expect(feedback_page.submit).to be_disabled
end

When(/^I feedback on the method of entry used$/) do
  feedback_page.keyboard.click
end

When(/^I feedback on the ways to improve$/) do
  feedback_page.comments_field.set 'Test feedback'
end

When(/^I select the feedback link from the header$/) do
  confirmation_page.phase_banner.feedback.link.click
end

Then(/^I should be taken to the feedback page$/) do
  expect(feedback_page).to be_displayed
end

Then(/^I select the feedback link from the complete page$/) do
  complete_page.feedback.click
end

Then(/^I should be able to give feedback on ways to make the check better$/) do
  expect(feedback_page).to have_comments_field
end

Then(/^I should see the submit button is not disabled$/) do
  expect(feedback_page.submit).to_not be_disabled
end

Given(/^I am on the feedback thanks page$/) do
  step 'I am on the complete page'
  step 'I choose to give feedback'
  step 'I have provided my feedback'
  step 'I should be able to submit my feedback'
end

When(/^I select next pupil$/) do
  feedback_thanks_page.next_pupil.click
end

Then(/^I should be logged out$/) do
  local_storage = page.evaluate_script('window.localStorage.getItem("feedback");')
  expect(local_storage).to be_nil
end

Then(/^I should be taken to the instructions page$/) do
  expect(start_page).to be_displayed
end

Then(/^my feedback should be saved$/) do
  local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("feedback");'))
  stored_check = SqlDbHelper.get_pupil_check_metadata(local_storage['checkCode'])
  wait_until {!SqlDbHelper.get_feedback(stored_check['id']).nil?}
  saved_feedback = SqlDbHelper.get_feedback(stored_check['id'])
  expect(saved_feedback['inputType']).to eql 3
  expect(saved_feedback['satisfactionRating']).to eql 1
  expect(saved_feedback['comments']).to eql 'Test feedback'
end


Given(/^I navigate to the complete page$/) do
  complete_page.load
end

And(/^I submit my feedback$/) do
  step 'I have provided my feedback'
  step 'I should be able to submit my feedback'
  step 'I should be shown the thanks page'
end

And(/^the live check window has closed$/) do
  SqlDbHelper.update_check_end_date((Date.today) - 5)
  REDIS_CLIENT.del 'checkWindow.sqlFindActiveCheckWindow'
end

Then(/^I should be able to add a pupil$/) do
  step 'I am on the add pupil page'
  step 'I have submitted valid pupil details'
  step 'the pupil details should be stored'
  step 'I should see a flash message to state the pupil has been added'
end

Then(/^I should not be able to add a pupil$/) do
  school_landing_page.pupil_register.click
  expect(find('h1').text).to eql 'Section unavailable'
end

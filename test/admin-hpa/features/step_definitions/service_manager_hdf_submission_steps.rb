When(/^I am on the manage hdf submission page of a school that has not signed the hdf$/) do
  step "I am on the search organisations page"
  step "I search for a valid DFE number"
  school_search_results_page.manage_hdf_submission.click
end

Then(/^there is no actions for the service manager$/) do
  expect(manage_hdf_submission_page).to_not have_delete_submission
  expect(manage_hdf_submission_page.deleted.text).to eql 'No'
end

Given(/^I am on the manage hdf submission page of a school that has signed the hdf$/) do
  step 'I am logged in'
  step 'I am on the declaration submitted page'
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step "I am on the search organisations page"
  step "I search for a valid DFE number"
  school_search_results_page.manage_hdf_submission.click
end

When(/^the service manager deletes the hdf submission$/) do
  manage_hdf_submission_page.delete_submission.click
  expect(manage_hdf_submission_page.deleted.text).to eql 'YES'
end

Then(/^the hdf submission for that school is deleted$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am logged in'
  hdf_form_page.load
  expect(hdf_form_page).to have_first_name
end

Given(/^I am on the manage hdf submission page of a school that previously had the hdf submission deleted$/) do
  step 'I am on the manage hdf submission page of a school that has signed the hdf'
  step 'the service manager deletes the hdf submission'
  expect(manage_hdf_submission_page.deleted.text).to eql 'YES'
  visit current_url
end

When(/^the service manager undoes the delete of the hdf submission$/) do
  manage_hdf_submission_page.undo_deletion.click
  expect(manage_hdf_submission_page.deleted.text).to eql 'No'
end

Then(/^the hdf submission for that school is returned to the submitted state$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am logged in'
  hdf_form_page.load
  expect(declaration_submitted_page).to be_displayed
end

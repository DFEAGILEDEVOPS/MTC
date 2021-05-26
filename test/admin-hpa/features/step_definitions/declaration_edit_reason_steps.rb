Then(/^reason page is displayed as per design$/) do
  step 'I am on the HDF form page'
  step 'I submit the form with the hdf name fields set as Test'
  expect(declaration_review_pupils_page.get_pupil_reason(@pupil_forename)).to eql @reason

end

When(/^headteacher edit reason for a pupil from HDF pupil list$/) do
  declaration_edit_reason_page.select_reason(@reason)
  page.execute_script "window.scrollBy(0,500)"
  declaration_edit_reason_page.save_button.click
end

Given(/^headteacher has updated reason '(.*)' for a pupil$/) do |reason|
  @reason = reason
  step 'I am on the review pupil detail page'
  step 'headteacher updates the pupils reason for not taking a check'
  step 'headteacher edit reason for a pupil from HDF pupil list'
end

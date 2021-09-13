Then(/^edit reason page is displayed as per design$/) do
  expect(declaration_edit_reason_page.pupil_name.text.eql?("#{@pupil_lastname}, #{@pupil_forename}")).to be_truthy, "Expected Pupil name: #{@pupil_lastname}, #{@pupil_forename}....But Actual: #{declaration_edit_reason_page.pupil_name.text}"
  expect(declaration_edit_reason_page).to have_attendance_codes
end

When(/^headteacher edit reason for a pupil from HDF pupil list$/) do
  declaration_edit_reason_page.select_reason(@reason)
  page.execute_script "window.scrollBy(0,500)"
  declaration_edit_reason_page.save_button.click
end

Given(/^headteacher has updated reason '(.*)' for a pupil$/) do |reason|
  @reason = reason
  step 'I am on the review pupil detail page'
  step 'headteacher select the pupil for updating its reason'
  step 'headteacher edit reason for a pupil from HDF pupil list'
end

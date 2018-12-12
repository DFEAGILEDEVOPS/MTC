When(/^I am on the Upload and View forms page v2$/) do
  testdeveloper_landing_page.upload_and_view_forms.click
end

Then(/^I should see the page matches design$/) do
  expect(upload_and_view_forms_v2_page).to have_heading
  expect(upload_and_view_forms_v2_page).to have_info
  expect(upload_and_view_forms_v2_page).to have_upload_new_form
  expect(upload_and_view_forms_v2_page).to have_related
end

When(/^I select to upload a new form$/) do
  upload_and_view_forms_v2_page.upload_new_form.click
end

Then(/^the upload form page matches design$/) do
  expect(upload_new_forms_page).to have_heading
  expect(upload_new_forms_page).to have_download_form_example_template
  expect(upload_new_forms_page).to have_new_form_info_message
  expect(upload_new_forms_page).to have_chose_file
  expect(upload_new_forms_page).to have_live_check_form
  expect(upload_new_forms_page).to have_familiarisation_check_form
  expect(upload_new_forms_page).to have_upload
  expect(upload_new_forms_page).to have_cancel
end

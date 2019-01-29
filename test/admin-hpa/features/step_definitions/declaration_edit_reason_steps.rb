Given(/^I am on the edit reason page$/) do
    step 'I am on the HDF review pupils page'
    @page.edit_user
    @page = declaration_edit_reason_page
end

Then(/^I can see the edit reason page as per the design$/) do
    expect(@page).to have_heading
    expect(@page).to have_details
    expect(@page).to have_attendance_codes
    expect(@page).to have_save_button
    expect(@page).to have_cancel_button
end

Given(/^I am on the HDF review pupils page$/) do
    declaration_review_pupils_page.load
    @page = declaration_review_pupils_page
end

Then(/^I can see hdf review pupils page as per the design$/) do
    expect(@page).to have_heading
    expect(@page).to have_message
    expect(@page).to have_pupils_table
    expect(@page).to have_continue_button
end

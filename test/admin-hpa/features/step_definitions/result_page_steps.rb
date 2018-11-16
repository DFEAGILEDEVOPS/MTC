Given(/^I have populated some results in database$/) do
  MongoDbHelper.populate_results('Pupil', 'Two', 9991001)
end


Given(/^I am on the results page|I click the Results link$/) do
  school_landing_page.results.click
end


Given(/^there are no answers in database$/) do
  MongoDbHelper.remove_results_for_school("9991001")
end

Then(/^I see an empty results page$/) do
  expect(results_page).to have_heading
  expect(results_page).to have_no_results_heading
  expect(results_page).to have_results_message
end

Then(/^I see the pupil results$/) do
  expect(results_page).to have_heading
  expect(results_page).to have_results_heading
  expect(results_page).to have_results_message
  expect(results_page.results.header[0].name.text).to eq("Name")
  expect(results_page.results.header[0].score.text).to eq("Score")
  expect(results_page.results.header[0].percentage.text).to eq("Percentage")
  expect(results_page.results.pupil_list[0].name.text).to eq("Pupil Two")
  expect(results_page.results.pupil_list[0].score.text).to eq("28/30")
  expect(results_page.results.pupil_list[0].percentage.text).to eq("93%")
end

When(/^I decide to logout from results page$/) do
  results_page.sign_out.click
end


And(/^I should see the download csv option$/) do
  expect(results_page).to have_download_csv
end
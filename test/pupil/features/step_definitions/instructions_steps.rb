Then(/^I should see a heading$/) do
  expect(start_page).to have_heading
end

Then(/^I should see a bulleted list of instructions$/) do
  expect(start_page).to have_bulleted_list_instructions
end

Then(/^I should see a start button$/) do
  expect(start_page).to have_start_warm_up
end

Then(/^I should see the timings between questions$/) do
  array_of_instructions = start_page.bulleted_list_instructions.map{|instruction| instruction.text}
  timings = JSON.parse page.evaluate_script('window.localStorage.getItem("config");')
  expect(array_of_instructions).to include "There will be 10 questions."
  expect(array_of_instructions).to include "Each question will show for #{timings['questionTime']} seconds."
end

Then(/^I should see the total number of questions in the check$/) do
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  expect(start_page.number_of_questions.text.scan(/\d+/).first.to_i).to eql questions.count
end
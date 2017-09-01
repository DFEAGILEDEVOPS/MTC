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
  expect(array_of_instructions).to include "Each question will show for #{timings['questionTime']} seconds."
  expect(array_of_instructions).to include "There will be a #{timings['loadingTime']}-second pause between each question."
  expect(array_of_instructions).to include "After #{timings['questionTime']} seconds, the number in the answer box will be accepted, even if you haven't pressed ‘Enter’."
end

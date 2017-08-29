Given(/^I have used all the keys on the on screen keyboard to complete the check$/) do
  step 'I have started the check'
  first= check_page.complete_question('12345', 'numpad')
  second = check_page.complete_question('67890', 'numpad')
  remaining = check_page.complete_check_with_correct_answers(18, 'numpad')
  @answers = [first, second, remaining].flatten
end

Then(/^I should see all my number pad inputs recorded$/) do
  local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("inputs");'))
  inputs = local_storage.compact.each {|b| b.each {|a| a.delete('clientInputDate')}}
  expect(inputs).to eql check_page.array_of_inputs_from_numpad(@answers)
end


Given(/^I have used the physical screen keyboard to complete the check$/) do
  step 'I have started the check'
  first= check_page.complete_question('12345', 'keyboard')
  second = check_page.complete_question('67890', 'keyboard')
  remaining = check_page.complete_check_with_correct_answers(18, 'keyboard')
  @answers = [first, second, remaining].flatten
end

Then(/^I should see all my keyboard inputs recorded$/) do
  local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("inputs");'))
  inputs = local_storage.compact.each {|b| b.each {|a| a.delete('clientInputDate')}}
  expect(inputs).to eql check_page.array_of_inputs_from_keyboard(@answers)
end


Given(/^I have used backspace to correct my answer using the on screen keyboard$/) do
  step 'I have started the check'
  check_page.number_pad.one.click
  check_page.number_pad.backspace.click
  check_page.complete_question('12345', 'numpad')
end

Then(/^I should see backspace numpad event recorded$/) do
  local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("inputs");'))
  inputs = local_storage.compact.each {|b| b.each {|a| a.delete('clientInputDate')}}[0]
  expected = [{"input"=>"left click", "eventType"=>"mousedown"}, {"input"=>"1", "eventType"=>"click"}, {"input"=>"left click", "eventType"=>"mousedown"}, {"input"=>"backspace", "eventType"=>"click"}]
  expected.each {|a| expect(inputs).to include a}
end

Given(/^I have used backspace to correct my answer using the physical keyboard$/) do
  step 'I have started the check'
  wait_until {check_page.has_number_pad?}
  check_page.number_pad.one.send_keys(:numpad1)
  check_page.number_pad.one.send_keys(:backspace)
  check_page.complete_question('12345', 'keyboard')
end


Then(/^I should see backspace keyboard event recorded$/) do
  local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("inputs");'))
  inputs = local_storage.compact.each {|b| b.each {|a| a.delete('clientInputDate')}}[0]
  expected = [{"input"=>"1", "eventType"=>"keydown"}, {"input"=>"Backspace", "eventType"=>"keydown"}]
  expected.each {|a| expect(inputs).to include a}
end

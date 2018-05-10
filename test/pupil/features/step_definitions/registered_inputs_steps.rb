Given(/^I have used all the keys on the on screen keyboard to complete the check$/) do
  step 'I have started the check'
  first= check_page.complete_question('12345', 'numpad')
  second = check_page.complete_question('67890', 'numpad')
  remaining = check_page.complete_check_with_correct_answers(8, 'numpad')
  @answers = [first, second, remaining].flatten
end

Then(/^I should see all my number pad inputs recorded$/) do
  inputs = JSON.parse(page.evaluate_script('window.localStorage.getItem("inputs");'))
  questions = JSON.parse(page.evaluate_script('window.localStorage.getItem("questions");')).map{|x| x['factor1'].to_s + 'x'+ x['factor2'].to_s }
  inputs1 = inputs.compact
  inputs = inputs1.each {|a| a.delete('clientTimestamp')}
  expect(inputs.flatten).to eql check_page.array_of_inputs_from_numpad(@answers, questions).flatten
end

Given(/^I have used the physical screen keyboard to complete the check$/) do
  step 'I have started the check using the keyboard'
  first= check_page.complete_question('12345', 'keyboard')
  second = check_page.complete_question('67890', 'keyboard')
  remaining = check_page.complete_check_with_correct_answers(8, 'keyboard')
  @answers = [first, second, remaining].flatten
end

Then(/^I should see all my keyboard inputs recorded$/) do
  local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("inputs");'))
  inputs1 = local_storage.compact
  inputs = inputs1.each {|a| a.delete('clientTimestamp')}
  questions = JSON.parse(page.evaluate_script('window.localStorage.getItem("questions");')).map{|x| x['factor1'].to_s + 'x'+ x['factor2'].to_s }
  expect(inputs.flatten).to eql check_page.array_of_inputs_from_keyboard(@answers,questions).flatten
end


Given(/^I have used backspace to correct my answer using the on screen keyboard$/) do
  step 'I have started the check'
  wait_until {check_page.has_number_pad?}
  check_page.number_pad.one.click
  check_page.number_pad.backspace.click
  check_page.complete_question('12345', 'numpad')
  check_page.complete_check_with_correct_answers(9, 'numpad')
end

Then(/^I should see backspace numpad event recorded$/) do
  local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("inputs");'))
  inputs1 = local_storage.compact
  inputs = inputs1.each {|a| a.delete('clientTimestamp')}
  expected = [{"input"=>"left click", "eventType"=>"mousedown", "question"=>"2x5", "sequenceNumber"=>1},
              {"input"=>"1", "eventType"=>"click", "question"=>"2x5", "sequenceNumber"=>1},
              {"input"=>"left click", "eventType"=>"mousedown", "question"=>"2x5", "sequenceNumber"=>1},
              {"input"=>"Backspace", "eventType"=>"click", "question"=>"2x5", "sequenceNumber"=>1}]
  expect([inputs[0], inputs[1], inputs[2], inputs[3]]).to eql expected
end

Given(/^I have used backspace to correct my answer using the physical keyboard$/) do
  step 'I have started the check using the keyboard'
  wait_until {check_page.has_number_pad?}
  check_page.number_pad.one.send_keys(:numpad1)
  check_page.number_pad.one.send_keys(:backspace)
  check_page.complete_question('12345', 'keyboard')
  check_page.complete_check_with_correct_answers(9, 'numpad')
end

Then(/^I should see backspace keyboard event recorded$/) do
  local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("inputs");'))
  inputs1 = local_storage.compact
  inputs = inputs1.each {|a| a.delete('clientTimestamp')}
  expected = [{"input"=>"1", "eventType"=>"keydown", "question"=>"2x5",
               "sequenceNumber"=>1}, {"input"=>"Backspace", "eventType"=>"keydown",
                                      "question"=>"2x5", "sequenceNumber"=>1}]
  expect([inputs[0], inputs[1]]).to eql expected
end

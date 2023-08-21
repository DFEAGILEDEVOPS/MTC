Given(/^I have used all the keys on the on screen keyboard to complete the check$/) do
  step 'I have started the check'
  first = check_page.complete_question('12345', 'numpad')
  second = check_page.complete_question('67890', 'numpad')
  remaining = check_page.complete_check_with_correct_answers(23, 'numpad')
  @answers = [first, second, remaining].flatten
end

Then(/^I should see all my number pad inputs recorded$/) do
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  storage_school = JSON.parse page.evaluate_script('window.localStorage.getItem("school");')
  check_result = SqlDBHelper.wait_for_received_check(storage_pupil['checkCode'])
  check = JSON.parse(LZString::UTF16.decompress(check_result['archive']))
  local_storage = check['inputs']

  questions = JSON.parse(page.evaluate_script('window.localStorage.getItem("questions");')).map {|x| x['factor1'].to_s + 'x' + x['factor2'].to_s}
  inputs1 = local_storage.compact
  inputs = inputs1.each {|a| a.delete('clientTimestamp')}
  monotonic_time = inputs.flatten.map {|m| m['monotonicTime']}
  array_of_inputs = check_page.array_of_inputs_from_numpad(@answers, questions).flatten
  array_of_inputs.each_with_index {|b, index| b['monotonicTime'] = monotonic_time[index]}
  expect(inputs.flatten).to eql array_of_inputs
end

Given(/^I have used the physical screen keyboard to complete the check$/) do
  step 'I have started the check using the keyboard'
  first = check_page.complete_question('12345', 'keyboard')
  second = check_page.complete_question('67890', 'keyboard')
  remaining = check_page.complete_check_with_correct_answers(23, 'keyboard')
  @answers = [first, second, remaining].flatten
  complete_page.wait_for_complete_page
end

Then(/^I should see all my keyboard inputs recorded$/) do
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  storage_school = JSON.parse page.evaluate_script('window.localStorage.getItem("school");')
  check_result = SqlDBHelper.wait_for_received_check(storage_pupil['checkCode'])
  check = JSON.parse(LZString::UTF16.decompress(check_result['archive']))
  local_storage = check['inputs']

  inputs1 = local_storage.compact
  inputs = inputs1.each {|a| a.delete('clientTimestamp')}
  questions = JSON.parse(page.evaluate_script('window.localStorage.getItem("questions");')).map {|x| x['factor1'].to_s + 'x' + x['factor2'].to_s}
  monotonic_time = inputs.flatten.map {|m| m['monotonicTime']}
  array_of_inputs = check_page.array_of_inputs_from_keyboard(@answers, questions).flatten
  array_of_inputs.each_with_index {|b, index| b['monotonicTime'] = monotonic_time[index]}

  expect(inputs.flatten).to eql array_of_inputs
end


Given(/^I have used backspace to correct my answer using the on screen keyboard$/) do
  step 'I have started the check'
  wait_until {check_page.has_number_pad?}
  check_page.number_pad.one.click
  check_page.number_pad.backspace.click
  check_page.complete_question('12345', 'numpad')
  check_page.complete_check_with_correct_answers(24, 'numpad')
end

Then(/^I should see backspace numpad event recorded$/) do
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  storage_school = JSON.parse page.evaluate_script('window.localStorage.getItem("school");')
  check_result = SqlDBHelper.wait_for_received_check(storage_pupil['checkCode'])
  check = JSON.parse(LZString::UTF16.decompress(check_result['archive']))
  local_storage = check['inputs']
  inputs1 = local_storage.compact
  inputs = inputs1.each {|a| a.delete('clientTimestamp')}
  backspace_input = inputs.select {|i| i['input'] == 'Backspace'}
  monotonic_time = backspace_input.map {|m| m['monotonicTime']}
  expected = ["input" => "Backspace", "eventType" => "mouse", "question" => "1x1", "sequenceNumber" => 1]
  expected.first["monotonicTime"] = monotonic_time.first
  expect(backspace_input).to eql expected
end

Given(/^I have used backspace to correct my answer using the physical keyboard$/) do
  step 'I have started the check using the keyboard'
  wait_until {check_page.has_number_pad?}
  check_page.number_pad.one.send_keys(:numpad1)
  check_page.number_pad.one.send_keys(:backspace)
  check_page.complete_question('12345', 'keyboard')
  check_page.complete_check_with_correct_answers(24, 'numpad')
  complete_page.wait_for_complete_page
end

Then(/^I should see backspace keyboard event recorded$/) do
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  storage_school = JSON.parse page.evaluate_script('window.localStorage.getItem("school");')
  check_result = SqlDBHelper.wait_for_received_check(storage_pupil['checkCode'])
  check = JSON.parse(LZString::UTF16.decompress(check_result['archive']))
  local_storage = check['inputs']

  inputs1 = local_storage.compact
  inputs = inputs1.each {|a| a.delete('clientTimestamp')}
  backspace_input = inputs.select {|i| i['input'] == 'Backspace'}
  monotonic_time = backspace_input.map {|m| m['monotonicTime']}
  expected = ["input" => "Backspace", "eventType" => "keyboard", "question" => "1x1", "sequenceNumber" => 1, "monotonicTime" => monotonic_time]
  expected.first["monotonicTime"] = monotonic_time.first
  expect(backspace_input).to eql expected
end

Then(/^I should see device information populated in local storage$/) do
  device_info = JSON.parse(page.evaluate_script('window.localStorage.getItem("device");'))
  check_device_information(device_info)
end

Then(/^the device information should be persisted to the DB$/) do
  device_info = JSON.parse(page.evaluate_script('window.localStorage.getItem("device");'))
  check_code = JSON.parse(page.evaluate_script('window.localStorage.getItem("pupil");'))['checkCode']
  data = SqlDbHelper.get_check_data(check_code)
  local_info = JSON.parse data['data']
  db_device_info = local_info['data']['device']
  expect(db_device_info).to eql device_info
end
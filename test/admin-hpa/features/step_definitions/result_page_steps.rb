
Given(/^multiple pupil has completed the check/) do
  step 'I have multiple pupils for restart'
end

When(/^we are in (.*) week of check end date without submitted HDF$/) do|check_end_week|
  today_date = Date.today

  if today_date.friday?
    today_date -= 1
  end

  while !today_date.friday?
    today_date -= 1
  end

  case check_end_week
    when '1st'
      SqlDbHelper.update_check_end_date(today_date)
    when '2nd'
      previous_to_previous_week_friday = today_date - 7
      SqlDbHelper.update_check_end_date(previous_to_previous_week_friday)
  end

  REDIS_CLIENT.keys.each do |key|
    if key.include?('checkWindow.sqlFindActiveCheckWindow')
      REDIS_CLIENT. del key
    end
  end

end

And(/^we are on Result page$/) do
  results_page.load
end

Then(/^Result page for no submitted hdf is displayed as per the design$/) do
  Timeout.timeout(120){pupil_register_page.load until REDIS_CLIENT.get("checkWindow.sqlFindActiveCheckWindow") != nil}
  results_page.load
  today_date = Date.today
  if today_date.saturday? || today_date.sunday?
    expect(results_page).to have_heading
  else
    expect(results_page).to have_heading
    expect(results_page).to have_no_hdf_message
    expect(results_page).to have_hdf_button
  end

end

Then(/^Result page is displayed as per the design$/) do
  expect(results_page).to have_heading
end

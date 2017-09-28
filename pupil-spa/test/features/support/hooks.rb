Before('@4_digit') do
  skip_this_scenario if AUTH == '5'
end

Before('@5_digit') do
  skip_this_scenario unless AUTH == '5'
end

Before('@non_browserstack_compliant') do
  skip_this_scenario if Capybara.current_driver.to_s.include? 'bs'
end

After('@end_date_reset') do
  original = MongoDbHelper.get_check_window_via_name('Summer 2017')
  updated = original.each{ |key,str| original['endDate'] = @original_date}
  collection=CLIENT[:checkwindows]
  collection.update_one({'_id' => original['_id']}, updated)
  p "Returned end date to #{@original_date}"
end
